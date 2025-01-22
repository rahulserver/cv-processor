import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import TextAlign from '@tiptap/extension-text-align';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ListItem from '@tiptap/extension-list-item';
import {
  Bold,
  Italic,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
} from 'lucide-react';
import { ParsedCV } from '@/lib/pdf/types';
import { toast } from 'sonner';
import { Extension, Node } from '@tiptap/core';

interface CVEditorProps {
  initialCV: ParsedCV;
  onSave: (updatedCV: ParsedCV) => void;
  onCancel: () => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
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
  );
};

// Create a custom node for fixed section headers
const FixedSection = Node.create({
  name: 'fixedSection',
  group: 'block',
  content: 'inline*',
  selectable: false,
  draggable: false,
  clickable: false,
  atom: true, // Makes the node a single unit
  parseHTML() {
    return [
      {
        tag: 'h2[data-type="fixed-section"]',
      },
    ];
  },
  renderHTML({ node }) {
    return ['h2', { 'data-type': 'fixed-section', class: 'fixed-section' }, 0];
  },
  addAttributes() {
    return {
      'data-type': {
        default: 'fixed-section',
      },
    };
  },
  addNodeView() {
    return ({ node, getPos }) => {
      const dom = document.createElement('h2');
      dom.setAttribute('data-type', 'fixed-section');
      dom.classList.add('fixed-section');
      dom.setAttribute('contenteditable', 'false');
      dom.textContent = node.textContent;
      return {
        dom,
        update: (node) => {
          dom.textContent = node.textContent;
          return true;
        },
      };
    };
  },
});

export function CVEditor({ initialCV, onSave, onCancel }: CVEditorProps) {
  const FIXED_SECTIONS = [
    'Summary',
    'Skills',
    'Experience',
    'Education',
    'Recruiter Details',
  ];

  const getInitialContent = () => {
    return `
      <h2>${initialCV.firstName || 'First Name'}</h2>
      <hr />

      <h2 data-type="fixed-section" class="fixed-section">Summary</h2>
      <p>${initialCV.objective || ''}</p>
      
      ${
        initialCV.skills && Object.keys(initialCV.skills).length > 0
          ? `
        <h2 data-type="fixed-section" class="fixed-section">Skills</h2>
        <ul style="list-style-position: outside; padding-left: 1.5em;">
          ${Object.entries(initialCV.skills)
            .map(
              ([category, skills]) =>
                `<li><strong>${category}</strong>: ${skills}</li>`,
            )
            .join('')}
        </ul>
      `
          : ''
      }
      
      ${
        initialCV.experience && initialCV.experience.length > 0
          ? `
        <h2 data-type="fixed-section" class="fixed-section">Experience</h2>
        ${initialCV.experience
          .map(
            (exp) => `
          <p><strong>${exp.position}</strong></p>
          <p>${exp.company} | ${exp.period}</p>
          ${
            exp.responsibilities && exp.responsibilities.length > 0
              ? `
            <ul style="list-style-position: outside; padding-left: 1.5em;">
              ${exp.responsibilities.map((resp) => `<li>${resp}</li>`).join('')}
            </ul>
          `
              : ''
          }
        `,
          )
          .join('')}
      `
          : ''
      }
      
      ${
        initialCV.education && initialCV.education.length > 0
          ? `
        <h2 data-type="fixed-section" class="fixed-section">Education</h2>
        ${initialCV.education
          .map(
            (edu) => `
          <p><strong>${edu.qualification}</strong></p>
          <p>${edu.institution} - ${edu.completionDate}</p>
        `,
          )
          .join('')}
      `
          : ''
      }

      <hr />
      <h2 data-type="fixed-section" class="fixed-section">Recruiter Details</h2>
      <p>${initialCV.recruiterDetails || ''}</p>
    `;
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable default heading
        bulletList: {
          HTMLAttributes: {
            style: 'list-style-position: outside; padding-left: 1.5em;',
          },
        },
      }),
      FixedSection,
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
      handleDrop: () => true, // Prevent drag and drop
      handleClick: (view, pos, event) => {
        const node = view.state.doc.nodeAt(pos);
        if (node?.type.name === 'fixedSection') {
          return true; // Prevent click on fixed sections
        }
        return false;
      },
      handleKeyDown: (view, event) => {
        const { selection } = view.state;
        const node = view.state.doc.nodeAt(selection.$from.pos);
        if (node?.type.name === 'fixedSection') {
          return true; // Prevent keyboard input on fixed sections
        }
        return false;
      },
    },
  });

  // Add styles for fixed sections
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .fixed-section {
        background-color: #f3f4f6;
        padding: 8px 12px;
        margin: 16px 0 8px 0;
        border-radius: 4px;
        pointer-events: none !important;
        user-select: none !important;
        position: relative;
        opacity: 0.8;
        cursor: not-allowed !important;
      }
      
      .fixed-section::after {
        content: "";
        font-size: 0.75em;
        color: #6b7280;
        font-weight: normal;
      }

      [data-type="fixed-section"] {
        cursor: not-allowed !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSave = () => {
    if (!editor) {
      toast.error('Editor not initialized');
      return;
    }

    try {
      const content = editor.getHTML();
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');

      // Extract content while preserving fixed section titles
      const updatedCV: ParsedCV = {
        ...initialCV,
        firstName: extractFirstName(content),
        objective: extractContent(content, 'Summary'),
        skills: extractSkills(content),
        experience: extractExperience(content),
        education: extractEducation(content),
        recruiterDetails: extractContent(content, 'Recruiter Details'),
      };

      // Validate required fields
      if (!updatedCV.firstName?.trim()) {
        toast.error('Name is required');
        return;
      }

      onSave(updatedCV);
      toast.success('CV updated successfully');
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error('Failed to save CV changes');
    }
  };

  const extractFirstName = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const firstH2 = doc.querySelector('h2');
    return firstH2?.textContent?.trim() || initialCV.firstName || '';
  };

  const extractContent = (html: string, sectionTitle: string): string => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const section = Array.from(doc.querySelectorAll('h2')).find(
        (h2) => h2.textContent?.trim() === sectionTitle,
      );
      const nextElement = section?.nextElementSibling;
      if (!section || !nextElement) return '';

      let content = '';
      let currentElement: Element | null = nextElement;

      while (currentElement && currentElement.tagName !== 'H2') {
        if (currentElement.textContent) {
          content += (content ? '\n' : '') + currentElement.textContent.trim();
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
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const skillsSection = Array.from(doc.querySelectorAll('h2')).find(
      (h2) => h2.textContent?.trim() === 'Skills',
    );
    if (!skillsSection) return {};

    const skillsList = skillsSection.nextElementSibling;
    if (!skillsList || skillsList.tagName !== 'UL') return {};

    const skills: { [key: string]: string } = {};
    Array.from(skillsList.querySelectorAll('li')).forEach((li) => {
      const strongTag = li.querySelector('strong');
      if (strongTag) {
        const category = strongTag.textContent?.replace(':', '').trim() || '';
        const skillsText =
          li.textContent
            ?.replace(strongTag.textContent || '', '')
            .replace(':', '')
            .trim() || '';
        if (category && skillsText) {
          skills[category] = skillsText;
        }
      }
    });

    return skills;
  };

  const extractExperience = (html: string): ParsedCV['experience'] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const experienceSection = Array.from(doc.querySelectorAll('h2')).find(
      (h2) => h2.textContent?.trim() === 'Experience',
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
          currentExperience.position = text;
        } else if (text.includes('|')) {
          // This is company and period
          const [company, period] = text.split('|').map((s) => s.trim());
          currentExperience.company = company;
          currentExperience.period = period;
        }
      } else if (currentElement.tagName === 'UL') {
        currentExperience.responsibilities = Array.from(
          currentElement.querySelectorAll('li'),
        ).map((li) => li.textContent?.trim() || '');
      }
      currentElement = currentElement.nextElementSibling;
    }

    if (Object.keys(currentExperience).length > 0) {
      experiences.push(currentExperience as ParsedCV['experience'][0]);
    }

    return experiences;
  };

  const extractEducation = (html: string): ParsedCV['education'] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const educationSection = Array.from(doc.querySelectorAll('h2')).find(
      (h2) => h2.textContent?.trim() === 'Education',
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
          const [institution, completionDate] = text
            .split('-')
            .map((s) => s.trim());
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
  };

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
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
