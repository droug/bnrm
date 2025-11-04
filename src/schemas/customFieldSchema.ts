import { z } from "zod";

export const fieldTypeEnum = z.enum([
  "text",
  "textarea",
  "select",
  "multiselect",
  "date",
  "number",
  "boolean",
  "link",
  "location",
  "coordinates",
  "reference",
  "file",
  "group",
]);

export const platformEnum = z.enum([
  "bnrm",
  "depot_legal",
  "bn",
  "activites_culturelles",
  "cbn",
]);

export const visibilityConditionSchema = z.object({
  field_key: z.string(),
  operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than"]),
  value: z.any(),
  logic: z.enum(["AND", "OR"]).optional(),
});

export const validationRuleSchema = z.object({
  min_length: z.number().optional(),
  max_length: z.number().optional(),
  regex: z.string().optional(),
  regex_message: z.string().optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  allowed_extensions: z.array(z.string()).optional(),
  max_file_size: z.number().optional(),
});

export const customFieldConfigSchema = z.object({
  field_key: z.string()
    .min(1, "La clé technique est requise")
    .regex(/^[a-z0-9_]+$/, "La clé doit contenir uniquement des lettres minuscules, chiffres et underscores"),
  field_type: fieldTypeEnum,
  section_key: z.string().optional(),
  order_index: z.number().int().min(0).optional(),
  insert_after: z.string().optional(),
  
  label_fr: z.string().min(1, "Le libellé français est requis"),
  label_ar: z.string().optional(),
  description_fr: z.string().optional(),
  description_ar: z.string().optional(),
  
  is_required: z.boolean().default(false),
  is_visible: z.boolean().default(true),
  is_readonly: z.boolean().default(false),
  default_value: z.string().optional(),
  
  validation_rules: validationRuleSchema.optional(),
  visibility_conditions: z.array(visibilityConditionSchema).optional(),
  
  config: z.object({
    options: z.array(z.object({
      value: z.string(),
      label_fr: z.string(),
      label_ar: z.string().optional(),
    })).optional(),
    reference_source: z.enum(["notices", "users", "editors", "printers", "distributors"]).optional(),
    mask_pattern: z.string().optional(),
  }).optional(),
});

export type CustomFieldConfig = z.infer<typeof customFieldConfigSchema>;
export type FieldType = z.infer<typeof fieldTypeEnum>;
export type Platform = z.infer<typeof platformEnum>;
export type VisibilityCondition = z.infer<typeof visibilityConditionSchema>;
export type ValidationRule = z.infer<typeof validationRuleSchema>;
