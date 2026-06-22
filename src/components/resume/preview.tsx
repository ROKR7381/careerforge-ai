"use client";

import { ResumeData, TemplateName } from "@/types/resume";
import { TemplateDublin } from "./templates/dublin";
import { TemplateToronto } from "./templates/toronto";
import { TemplateStockholm } from "./templates/stockholm";
import { TemplateLondon } from "./templates/london";
import { TemplateSydney } from "./templates/sydney";
import { TemplateBerlin } from "./templates/berlin";
import { TemplateTokyo } from "./templates/tokyo";
import { TemplateNewYork } from "./templates/newyork";
import { TemplateParis } from "./templates/paris";
import { TemplateMelbourne } from "./templates/melbourne";
import { TemplateKolkata } from "./templates/kolkata";
import { TemplateDelhi } from "./templates/delhi";
import { TemplateBangalore } from "./templates/bangalore";
import { TemplateMumbai } from "./templates/mumbai";

interface Props {
  resume: ResumeData;
  template: TemplateName;
}

export function ResumePreview({ resume, template }: Props) {
  return (
    <div className="resume-preview print:shadow-none" id="resume-preview">
      {template === "dublin" && <TemplateDublin resume={resume} />}
      {template === "toronto" && <TemplateToronto resume={resume} />}
      {template === "stockholm" && <TemplateStockholm resume={resume} />}
      {template === "london" && <TemplateLondon resume={resume} />}
      {template === "sydney" && <TemplateSydney resume={resume} />}
      {template === "berlin" && <TemplateBerlin resume={resume} />}
      {template === "tokyo" && <TemplateTokyo resume={resume} />}
      {template === "newyork" && <TemplateNewYork resume={resume} />}
      {template === "paris" && <TemplateParis resume={resume} />}
      {template === "melbourne" && <TemplateMelbourne resume={resume} />}
      {template === "kolkata" && <TemplateKolkata resume={resume} />}
      {template === "delhi" && <TemplateDelhi resume={resume} />}
      {template === "bangalore" && <TemplateBangalore resume={resume} />}
      {template === "mumbai" && <TemplateMumbai resume={resume} />}
    </div>
  );
}
