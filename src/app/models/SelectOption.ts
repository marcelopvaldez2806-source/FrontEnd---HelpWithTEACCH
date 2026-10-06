export interface SelectOption {
  label: string;
  value: any;
}

export interface AdvancedField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'number' | 'email' | 'password' | 'search';
  value: any;
  icon?: string;
}

export interface KpiItem {
  title: string;
  value: string | number;
  footer: string;
  icon: string;
  iconClass?: string;
  footerClass?: string;
}
