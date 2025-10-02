// Certificate Request DTO
export interface CertificateRequestDTO {
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
  templateId?: number;
}

// Certificate Response DTO
export interface CertificateResponseDTO {
  id: number;
  serialNumber: string;
  subjectDN: string;
  issuerDN: string;
  certificateType: string;
  validFrom: Date;
  validTo: Date;
  revoked: boolean;
  revocationDate?: Date;
  revocationReason?: string;
  certificateData: string;
  hasPrivateKey: boolean;
}

// Certificate List DTO
export interface CertificateListDTO {
  id: number;
  serialNumber: string;
  commonName: string;
  subjectDN: string;
  certificateType: string;
  validFrom: Date;
  validTo: Date;
  revoked: boolean;
  issuerCommonName: string;
}

// CSR Request DTO
export interface CSRRequestDTO {
  csrData: string;
  issuerCertificateId: number;
  validityDays: number;
  templateId?: number;
}

// Revocation Request DTO
export interface RevocationRequestDTO {
  certificateId: number;
  revocationReason: string;
  reasonText?: string;
}

// Keystore Download DTO
export interface KeystoreDownloadDTO {
  certificateId: number;
  keystorePassword: string;
  keystoreType: string;
  alias: string;
}

// Template Request DTO
export interface TemplateRequestDTO {
  templateName: string;
  caIssuerId: number;
  commonNameRegex?: string;
  sanRegex?: string;
  maxTtlDays?: number;
  defaultKeyUsage?: string;
  defaultExtendedKeyUsage?: string;
}

// Template Response DTO
export interface TemplateResponseDTO {
  id: number;
  templateName: string;
  caIssuerName: string;
  commonNameRegex?: string;
  sanRegex?: string;
  maxTtlDays?: number;
  defaultKeyUsage?: string;
  defaultExtendedKeyUsage?: string;
  createdBy: string;
  createdAt: Date;
}

export interface AutoGenerateCertificateDTO {
  commonName: string;
  organizationName?: string;
  organizationalUnit?: string;
  countryCode?: string;
  emailAddress?: string;
  locality?: string;
  state?: string;
  
  issuerCertificateId: number;
  validFrom: string;
  validTo: string;
  
  algorithm?: string;
  keySize?: number;
  
  keyUsage?: string[];
  extendedKeyUsage?: string[];
  subjectAlternativeNames?: string[];
  
  keystoreType?: string;
  keystorePassword: string;
  alias?: string;
}

export interface AutoGenerateResponseDTO {
  certificateId: number;
  serialNumber: string;
  subjectDN: string;
  keystoreBytes: Blob;
  message: string;
}