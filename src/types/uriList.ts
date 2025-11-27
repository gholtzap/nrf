export interface LinkObject {
  href: string;
}

export interface UriList {
  _links: {
    self?: LinkObject;
    item?: LinkObject[];
    [key: string]: LinkObject | LinkObject[] | undefined;
  };
  totalItemCount?: number;
}
