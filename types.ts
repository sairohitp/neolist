
export interface ChecklistItemType {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoType {
  id: string;
  title: string;
  notes: string;
  checklist: ChecklistItemType[];
  createdAt: number;
  updatedAt: number;
}