export interface ListItem {
  avatar: string;
  title: string;
  datetime: string;
  type: string;
  description: string;
  status?: "" | "success" | "warning" | "info" | "danger";
  extra?: string;
}

export interface TabItem {
  key: string;
  name: string;
  list: ListItem[];
}

export const noticesData: TabItem[] = [
  {
    key: "1",
    name: "通知",
    list: []
  },
  {
    key: "2",
    name: "消息",
    list: []
  },
  {
    key: "3",
    name: "代办",
    list: []
  }
];
