import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Registering a clean font for that "HD" look
Font.register({
  family: "Inter",
  src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    fontFamily: "Inter",
    padding: 0,
  },
  leftColumn: {
    width: "32%",
    backgroundColor: "#0F172A", // Deep Slate - Very Classy
    color: "#FFFFFF",
    padding: 30,
    height: "100%",
  },
  rightColumn: {
    width: "68%",
    padding: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 12,
    color: "#6366F1", // Vibrant Indigo
    marginBottom: 20,
    fontWeight: "medium",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginBottom: 10,
    marginTop: 20,
    color: "#1E293B",
    paddingBottom: 4,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6366F1",
    marginBottom: 10,
    marginTop: 20,
    textTransform: "uppercase",
  },
  content: {
    fontSize: 10,
    color: "#475569",
    lineHeight: 1.6,
    marginBottom: 10,
  },
  sidebarContent: {
    fontSize: 9,
    color: "#CBD5E1",
    marginBottom: 8,
    lineHeight: 1.4,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet: {
    width: 10,
    fontSize: 10,
  },
});

export const ModernTemplate = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Sidebar */}
      <View style={styles.leftColumn}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>
          CONTACT
        </Text>
        <Text style={styles.sidebarContent}>
          {data.email || "hello@reallygreatsite.com"}
        </Text>
        <Text style={styles.sidebarContent}>
          {data.phone || "+123-456-7890"}
        </Text>
        <Text style={styles.sidebarContent}>
          {data.address || "City, Country"}
        </Text>

        <Text style={styles.sidebarTitle}>SKILLS</Text>
        {data.skills?.map((skill: string, i: number) => (
          <Text key={i} style={styles.sidebarContent}>
            • {skill}
          </Text>
        ))}

        <Text style={styles.sidebarTitle}>EDUCATION</Text>
        <Text
          style={[styles.sidebarContent, { fontWeight: "bold" }]}
        >
          {data.degree || "Bachelors"}
        </Text>
        <Text style={styles.sidebarContent}>
          {data.university || "University Name"}
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.rightColumn}>
        <Text style={styles.name}>{data.fullName || "YOUR NAME"}</Text>
        <Text style={styles.title}>
          {data.title || "SOFTWARE ENGINEER"}
        </Text>

        <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
        <Text style={styles.content}>
          {data.summary || "A highly motivated professional..."}
        </Text>

        <Text style={styles.sectionTitle}>WORK EXPERIENCE</Text>
        {data.experience?.map((exp: any, i: number) => (
          <View key={i} style={{ marginBottom: 15 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                {exp.company}
              </Text>
              <Text style={{ fontSize: 9, color: "#64748B" }}>
                {exp.year}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 10,
                color: "#6366F1",
                marginBottom: 5,
              }}
            >
              {exp.role}
            </Text>
            <Text style={styles.content}>{exp.description}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
