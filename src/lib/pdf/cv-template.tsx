import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { ParsedCV } from './types';

// Register fonts if needed
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: '/fonts/Helvetica.ttf' },
    { src: '/fonts/Helvetica-Bold.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    borderBottom: '1pt solid black',
    paddingBottom: 5,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  skillCategory: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  skillContent: {
    marginLeft: 15,
    marginBottom: 5,
  },
  experienceItem: {
    marginBottom: 10,
  },
  position: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  company: {
    marginBottom: 5,
  },
  bullet: {
    marginLeft: 15,
    marginBottom: 2,
  },
  educationItem: {
    marginBottom: 8,
  },
});

export const createCV = (data: ParsedCV) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.name}>{data.firstName}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.content}>{data.objective}</Text>
      </View>

      {data.skills && Object.keys(data.skills).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          {Object.entries(data.skills).map(([category, skills]) => (
            <View key={category}>
              <Text style={styles.skillCategory}>{category}:</Text>
              <Text style={styles.skillContent}>{skills}</Text>
            </View>
          ))}
        </View>
      )}

      {data.experience?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.experience.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <Text style={styles.position}>{exp.position}</Text>
              <Text style={styles.company}>
                {exp.company} | {exp.period}
              </Text>
              {exp.responsibilities?.map((resp, idx) => (
                <Text key={idx} style={styles.bullet}>
                  • {resp}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {data.education?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={index} style={styles.educationItem}>
              <Text style={styles.position}>{edu.qualification}</Text>
              <Text style={styles.content}>
                {edu.institution} - {edu.completionDate}
              </Text>
            </View>
          ))}
        </View>
      )}

      {data.recruiterDetails && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recruiter Details</Text>
          <Text style={styles.content}>{data.recruiterDetails}</Text>
        </View>
      )}
    </Page>
  </Document>
);
