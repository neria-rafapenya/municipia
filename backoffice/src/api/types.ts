export type TokenResponse = {
  accessToken: string;
  tokenType?: string;
  expiresAt: string;
};

export type AuthProfile = {
  id: number;
  municipalityId: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
};

export type UserRole = "ADMIN" | "OPERATOR" | "NEIGHBOR" | string;

export type UserResponse = {
  id: number;
  municipalityId: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: UserRole;
};

export type CategoryResponse = {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
};

export type NewsResponse = {
  id: number;
  municipalityId: number;
  title: string;
  summary?: string | null;
  content: string;
  imageUrl?: string | null;
  active: boolean;
};

export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED" | string;

export type IncidentAttachmentResponse = {
  id: number;
  fileUrl: string;
  fileName?: string | null;
  fileType?: string | null;
  createdAt?: string | null;
};

export type IncidentResponse = {
  id: number;
  municipalityId: number;
  userId: number;
  assignedOperatorId?: number | null;
  categoryId?: number | null;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
  locationCapturedAt?: string | null;
  imageUrl?: string | null;
  resolutionImageUrl?: string | null;
  status: IncidentStatus;
  aiConfidence?: number | null;
  attachments: IncidentAttachmentResponse[];
};

export type IncidentHistoryResponse = {
  id: number;
  incidentId: number;
  municipalityId: number;
  changedByUserId: number;
  previousStatus?: string | null;
  newStatus?: string | null;
  changedAt?: string | null;
  operatorComment?: string | null;
};

export type MunicipalityResponse = {
  id: number;
  name: string;
  postalCode: string;
  configJson?: string | null;
};

export type UploadResponse = {
  url: string;
  publicId: string;
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
};
