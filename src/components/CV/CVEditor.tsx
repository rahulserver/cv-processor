import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import TextAlign from '@tiptap/extension-text-align'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ListItem from '@tiptap/extension-list-item';
import { 
  Bold, 
  Italic, 
  List, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Heading1,
  Heading2
} from 'lucide-react'
import { ParsedCV } from '@/lib/pdf/types'
import { toast } from "sonner"

interface CVEditorProps {
  initialCV: ParsedCV;
  onSave: (updatedCV: ParsedCV) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b p-2 flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-accent' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-accent' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-accent' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function CVEditor({ initialCV, onSave }: CVEditorProps) {
  const getInitialContent = () => {
    return `
      <h2>${initialCV.firstName || 'First Name'}</h2>
      <hr />

      <h2>Summary</h2>
      <p>${initialCV.objective || ''}</p>
      
      ${initialCV.skills && Object.keys(initialCV.skills).length > 0 ? `
        <h2>Skills</h2>
        <ul style="list-style-position: outside; padding-left: 1.5em;">
          ${Object.entries(initialCV.skills).map(([category, skills]) => 
            `<li><strong>${category}</strong>: ${skills}</li>`
          ).join('')}
        </ul>
      ` : ''}
      
      ${initialCV.experience && initialCV.experience.length > 0 ? `
        <h2>Experience</h2>
        ${initialCV.experience.map(exp => `
          <p><strong>${exp.position}</strong></p>
          <p>${exp.company} | ${exp.period}</p>
          ${exp.responsibilities && exp.responsibilities.length > 0 ? `
            <ul style="list-style-position: outside; padding-left: 1.5em;">
              ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
            </ul>
          ` : ''}
        `).join('')}
      ` : ''}
      
      ${initialCV.education && initialCV.education.length > 0 ? `
        <h2>Education</h2>
        ${initialCV.education.map(edu => `
          <p><strong>${edu.qualification}</strong></p>
          <p>${edu.institution} - ${edu.completionDate}</p>
        `).join('')}
      ` : ''}

      <hr />
      <h2>Recruiter Details</h2>
      <p>${initialCV.recruiterDetails || ''}</p>
    `
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            style: 'list-style-position: outside; padding-left: 1.5em;'
          }
        }
      }),
      Heading.configure({
        levels: [1, 2],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: getInitialContent(),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  });
  
  const handleSave = () => {
    if (!editor) {
      toast.error('Editor not initialized');
      return;
    }
    
    try {
      const content = editor.getHTML();
      
      // Parse the HTML content back into CV structure
      const updatedCV: ParsedCV = {
        ...initialCV,
        firstName: extractFirstName(content) || initialCV.firstName || '',
        objective: extractContent(content, 'Summary') || initialCV.objective || '',
        skills: extractSkills(content) || initialCV.skills || {},
        experience: extractExperience(content) || initialCV.experience || [],
        education: extractEducation(content) || initialCV.education || [],
        recruiterDetails: extractContent(content, 'Recruiter Details') || initialCV.recruiterDetails || '',
        formattingNotes: initialCV.formattingNotes || [],
        piiRemoved: initialCV.piiRemoved || []
      };

      // Validate required fields
      if (!updatedCV.firstName?.trim()) {
        toast.error('Name is required');
        return;
      }

      // Validate experience entries if they exist
      if (updatedCV.experience.length > 0) {
        for (const exp of updatedCV.experience) {
          if (!exp.company?.trim() || !exp.position?.trim() || !exp.period?.trim()) {
            toast.error('All experience entries must have company, position, and period');
            return;
          }
        }
      }

      // Log the extracted content for debugging
      console.log('Extracted CV:', {
        firstName: updatedCV.firstName,
        objective: updatedCV.objective,
        skills: updatedCV.skills,
        experience: updatedCV.experience,
        education: updatedCV.education,
        recruiterDetails: updatedCV.recruiterDetails
      });

      onSave(updatedCV);
      toast.success('CV updated successfully');
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error('Failed to save CV changes');
    }
  }

  const extractFirstName = (html: string): string => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const firstH2 = doc.querySelector('h2');
      return firstH2?.textContent?.trim() || '';
    } catch (error) {
      console.error('Error extracting name:', error);
      return '';
    }
  };

  const extractContent = (html: string, sectionTitle: string): string => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const section = Array.from(doc.querySelectorAll('h2')).find(h2 => 
        h2.textContent?.trim() === sectionTitle
      );
      
      if (!section) return '';
      
      let content = '';
      let currentElement = section.nextElementSibling;
      
      while (currentElement && currentElement.tagName !== 'H2' && currentElement.tagName !== 'HR') {
        if (currentElement.textContent) {
          const text = currentElement.textContent.trim();
          if (text) {
            content += (content ? '\n' : '') + text;
          }
        }
        currentElement = currentElement.nextElementSibling;
      }
      
      return content;
    } catch (error) {
      console.error(`Error extracting ${sectionTitle}:`, error);
      return '';
    }
  };

  const extractSkills = (html: string): { [key: string]: string } => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const skillsSection = Array.from(doc.querySelectorAll('h2')).find(h2 => 
        h2.textContent?.trim() === 'Skills'
      );
      if (!skillsSection) return {};

      const skillsList = skillsSection.nextElementSibling;
      if (!skillsList || skillsList.tagName !== 'UL') return {};

      const skills: { [key: string]: string } = {};
      Array.from(skillsList.querySelectorAll('li')).forEach(li => {
        const strongTag = li.querySelector('strong');
        if (strongTag) {
          const category = strongTag.textContent?.replace(':', '').trim() || '';
          const skillsText = li.textContent?.replace(strongTag.textContent || '', '').replace(':', '').trim() || '';
          if (category && skillsText) {
            skills[category] = skillsText;
          }
        }
      });

      return skills;
    } catch (error) {
      console.error('Error extracting skills:', error);
      return {};
    }
  };

  const extractExperience = (html: string): ParsedCV['experience'] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const experienceSection = Array.from(doc.querySelectorAll('h2')).find(h2 => 
      h2.textContent?.trim() === 'Experience'
    );
    if (!experienceSection) return [];

    const experiences: ParsedCV['experience'] = [];
    let currentElement = experienceSection.nextElementSibling;
    let currentExperience: Partial<ParsedCV['experience'][0]> = {};

    while (currentElement && currentElement.tagName !== 'H2') {
      if (currentElement.tagName === 'P') {
        const text = currentElement.textContent?.trim() || '';
        if (currentElement.querySelector('strong')) {
          // This is a position
          if (Object.keys(currentExperience).length > 0) {
            experiences.push(currentExperience as ParsedCV['experience'][0]);
            currentExperience = {};
          }
          currentExperience.position = text.replace(/\s*\|\s*.*$/, '');
        } else if (text.includes('|')) {
          // This is company and period
          const [company, period] = text.split('|').map(s => s.trim());
          currentExperience.company = company;
          currentExperience.period = period;
        }
      } else if (currentElement.tagName === 'UL') {
        currentExperience.responsibilities = Array.from(currentElement.querySelectorAll('li'))
          .map(li => li.textContent?.trim() || '');
      }
      currentElement = currentElement.nextElementSibling;
    }

    if (Object.keys(currentExperience).length > 0) {
      experiences.push(currentExperience as ParsedCV['experience'][0]);
    }

    return experiences;
  }

  const extractEducation = (html: string): ParsedCV['education'] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const educationSection = Array.from(doc.querySelectorAll('h2')).find(h2 => 
      h2.textContent?.trim() === 'Education'
    );
    if (!educationSection) return [];

    const education: ParsedCV['education'] = [];
    let currentElement = educationSection.nextElementSibling;
    let currentEducation: Partial<ParsedCV['education'][0]> = {};

    while (currentElement && currentElement.tagName !== 'H2') {
      if (currentElement.tagName === 'P') {
        const text = currentElement.textContent?.trim() || '';
        if (currentElement.querySelector('strong')) {
          if (Object.keys(currentEducation).length > 0) {
            education.push(currentEducation as ParsedCV['education'][0]);
            currentEducation = {};
          }
          currentEducation.qualification = text;
        } else if (text.includes('-')) {
          const [institution, completionDate] = text.split('-').map(s => s.trim());
          currentEducation.institution = institution;
          currentEducation.completionDate = completionDate;
        }
      }
      currentElement = currentElement.nextElementSibling;
    }

    if (Object.keys(currentEducation).length > 0) {
      education.push(currentEducation as ParsedCV['education'][0]);
    }

    return education;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Edit CV</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <MenuBar editor={editor} />
          <div className="p-4">
            <EditorContent editor={editor} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}