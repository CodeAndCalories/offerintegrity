type Field = {
  key: string;
  label: string;
  required: boolean;
  type: string;
  placeholder?: string;
  maxLen?: number;
  options?: string[];   // ← this was missing, causing the error
};

type Step = {
  id: number;
  title: string;
  subtitle: string;
  fields: Field[];
  isLast?: boolean;
};
