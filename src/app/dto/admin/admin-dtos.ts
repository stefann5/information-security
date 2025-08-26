// src/app/dto/admin/admin-dtos.ts

export interface CAUserResponseDTO {
  id: number;
  username: string;
  name: string;
  surname: string;
  organization: string;
  active: boolean;
  createdAt: Date;
  certificateCount: number;
}

export interface CreateCAUserRequestDTO {
  username: string;
  password: string;
  name: string;
  surname: string;
  organization: string;
}

export interface AdminCertificateRequestDTO {
  caUserId: number;
  commonName: string;
  organizationName?: string;
  organizationalUnit?: string;
  countryCode?: string;
  emailAddress?: string;
  locality?: string;
  state?: string;
  subjectAlternativeNames?: string[];
  validFrom: Date;
  validTo: Date;
  keyUsage?: string[];
  extendedKeyUsage?: string[];
  isCA?: boolean;
  pathLenConstraint?: number;
  issuerCertificateId?: number;
  certificateType: string;
  keySize?: number;
  algorithm?: string;
  description?: string;
}