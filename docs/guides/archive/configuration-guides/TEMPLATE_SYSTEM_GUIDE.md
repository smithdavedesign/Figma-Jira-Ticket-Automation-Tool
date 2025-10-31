# 🎯 Template System Overview

This directory contains parameterized templates for generating high-quality documentation across different platforms and document types.

## 📁 Directory Structure

```
templates/
├── README.md                 # This file
├── template-config.ts        # Template engine and configuration
├── template-types.ts         # TypeScript interfaces
├── jira/                     # Jira ticket templates
│   ├── component.yml         # Component development tickets
│   ├── feature.yml           # Feature implementation tickets
│   ├── bug.yml               # Bug fix tickets
│   └── epic.yml              # Epic templates
├── confluence/               # Confluence documentation templates
│   ├── component-docs.yml    # Component documentation
│   ├── api-docs.yml          # API documentation
│   └── design-system.yml     # Design system docs
├── wiki/                     # Wiki documentation templates
│   ├── component-guide.yml   # Component usage guides
│   └── implementation.yml    # Implementation guides
├── figma/                    # Figma-specific templates
│   ├── design-handoff.yml    # Design handoff documents
│   └── component-spec.yml    # Component specifications
├── github/                   # GitHub issue templates
│   ├── issue.yml             # GitHub issue templates
│   └── pr-template.yml       # Pull request templates
├── linear/                   # Linear ticket templates
│   ├── feature.yml           # Linear feature tickets
│   └── bug.yml               # Linear bug tickets
└── notion/                   # Notion page templates
    ├── project-brief.yml     # Project documentation
    └── component-page.yml    # Component pages
```

## 🔧 Template Configuration

Each template is a YAML file with the following structure:

```yaml
template_id: "component_development"
version: "2.1.0"
organization: "default"
platform: "jira"

variables:
  component_name: "{{ figma.component_name }}"
  technologies: "{{ project.tech_stack }}"
  design_ref: "{{ figma.frame_id }}"
  complexity_level: "{{ calculated.complexity }}"

team_standards:
  testing_framework: "{{ org.testing_stack }}"
  accessibility_level: "{{ org.accessibility_standard }}"
  documentation_format: "{{ org.docs_format }}"

output_format:
  ticket_type: "{{ org.project_management_tool }}"
  sections: ["requirements", "design_tokens", "acceptance_criteria"]

customization:
  include_ai_context_markers: true
  generate_test_files: true
  create_storybook_stories: true
```

## 🚀 Usage

Templates are automatically selected based on:
1. Document type (`jira`, `confluence`, etc.)
2. Component type (`component`, `feature`, `bug`)
3. Organization settings
4. Project configuration

## 📊 Variable Substitution

Templates support variable substitution from multiple sources:
- **Figma Context**: `{{ figma.component_name }}`, `{{ figma.frame_id }}`
- **Project Settings**: `{{ project.tech_stack }}`, `{{ project.name }}`
- **Calculated Values**: `{{ calculated.complexity }}`, `{{ calculated.hours }}`
- **Organization Standards**: `{{ org.testing_stack }}`, `{{ org.accessibility_standard }}`
- **Team Preferences**: `{{ team.workflow }}`, `{{ team.tools }}`

## 🎯 Best Practices

1. **Consistency**: Use consistent variable naming across templates
2. **Fallbacks**: Always provide default values for variables
3. **Validation**: Include schema validation for template configurations
4. **Documentation**: Document all available variables and their sources
5. **Versioning**: Use semantic versioning for template updates