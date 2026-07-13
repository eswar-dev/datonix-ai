import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { individualRatings, skillsMatrix } from "@/domains/aec/data/skills";
import { cn } from "@/common/lib/utils";

function ratingColor(r: number) {
  if (r >= 4) return "text-success font-semibold";
  if (r >= 3) return "text-accent";
  return "text-muted-foreground";
}

export default function SkillsMatrix() {
  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Skills Matrix"
        subtitle="Entity skill capacity and individual ratings across MA, ME, and MC."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Skills Matrix" },
        ]}
      />

      {skillsMatrix.map((table) => (
        <Card key={table.entity} className="rounded-card">
          <CardHeader>
            <CardTitle className="text-base">{table.entity}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill</TableHead>
                  <TableHead className="text-right">Resources</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Util %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.skills.map((skill) => (
                  <TableRow key={skill.name}>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell className="text-right">{skill.resources}</TableCell>
                    <TableCell className="text-right">{skill.available}</TableCell>
                    <TableCell className={cn("text-right font-semibold", skill.util >= 90 ? "text-destructive" : "")}>
                      {skill.util}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Individual Skill Ratings (1–5)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Role</TableHead>
                {individualRatings[0]?.skills.map((s) => (
                  <TableHead key={s.name} className="text-center">{s.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {individualRatings.map((person) => (
                <TableRow key={person.name}>
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>{person.entity}</TableCell>
                  <TableCell className="text-muted-foreground">{person.role}</TableCell>
                  {person.skills.map((s) => (
                    <TableCell key={s.name} className={cn("text-center", ratingColor(s.rating))}>
                      {s.rating}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
