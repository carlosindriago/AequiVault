export interface AccountGroupDto {
  id: string;
  code: string;
  name: string;
  path: string;
}

export interface AccountGroupRequest {
  parentId?: string;
  code: string;
  name: string;
}

export interface AccountGroupNode {
  id: string;
  code: string;
  name: string;
  path: string;
  children: AccountGroupNode[];
  accounts: any[];
  isExpanded?: boolean;
}
