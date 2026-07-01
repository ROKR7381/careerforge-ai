import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2pt solid #6366f1",
    paddingBottom: 10,
  },
  name: {
    fontSize: 28,
    color: "#1e293b",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  jobTitle: {
    fontSize: 14,
    color: "#6366f1",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    borderBottom: "1pt solid #e2e8f0",
  },
  content: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 1.6,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemBlock: {
    marginBottom: 15,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
  },
  itemSubtitle: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 10,
    color: "#94a3b8",
  },
  bulletList: {
    marginTop: 2,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletPoint: {
    fontSize: 11,
    color: "#6366f1",
    marginRight: 4,
  },
  bulletText: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 1.5,
    flex: 1,
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  skillCategory: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
    width: 100,
  },
  skillItems: {
    fontSize: 11,
    color: "#475569",
    flex: 1,
  },
  inlineItem: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 4,
  },
});

interface Props {
  data: ResumeData;
}

export function ResumePDF({ data }: Props) {
  const { personal_info: p } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{p.full_name || "Your Name"}</Text>
          <Text style={styles.jobTitle}>{p.professional_title || "Professional Title"}</Text>
          {(p.email || p.phone || p.location) && (
            <Text style={[styles.content, { marginTop: 4, marginBottom: 0 }]}>
              {[p.location, p.phone, p.email].filter(Boolean).join(" | ")}
            </Text>
          )}
        </View>

        {/* Summary */}
        {data.summary && (
          <View>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.content}>{data.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={styles.itemBlock}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text style={styles.itemSubtitle}>
                      {exp.company}{exp.location ? `, ${exp.location}` : ""}
                    </Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDateRange(exp.start_date, exp.end_date)}
                  </Text>
                </View>
                {exp.description.filter(Boolean).length > 0 && (
                  <View style={styles.bulletList}>
                    {exp.description.filter(Boolean).map((bullet, j) => (
                      <View key={j} style={styles.bulletRow}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={styles.itemBlock}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{edu.degree}</Text>
                    <Text style={styles.itemSubtitle}>
                      {edu.institution}{edu.location ? `, ${edu.location}` : ""}
                    </Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDateRange(edu.start_date, edu.end_date)}
                  </Text>
                </View>
                {edu.description && (
                  <Text style={styles.content}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            {data.skills.map((group, i) => (
              <View key={i} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{group.category}</Text>
                <Text style={styles.skillItems}>{group.skills.join(", ")}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={styles.itemBlock}>
                <View style={styles.row}>
                  <Text style={styles.itemTitle}>
                    {proj.name}
                    {proj.role ? ` — ${proj.role}` : ""}
                  </Text>
                </View>
                <Text style={styles.content}>{proj.description}</Text>
                {proj.link && (
                  <Text style={[styles.content, { marginBottom: 0 }]}>
                    {proj.link}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((cert, i) => (
              <Text key={i} style={styles.inlineItem}>
                {cert.name} — {cert.issuer}{cert.date ? ` (${cert.date})` : ""}
              </Text>
            ))}
          </View>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Languages</Text>
            {data.languages.map((lang, i) => (
              <Text key={i} style={styles.inlineItem}>
                {lang.name} — {lang.proficiency}
              </Text>
            ))}
          </View>
        )}

        {/* Accomplishments */}
        {data.accomplishments.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Accomplishments</Text>
            {data.accomplishments.filter(Boolean).map((acc, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>{acc}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
