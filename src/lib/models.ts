export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

export interface PageMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface Machine {
  id: number;
  avatar: string;
  name: string;
  os: string;
  points: number;
  rating: number;
  ratingCount: number;
  releaseDate: string;
  retiredDate: string;
  free: boolean;
  difficulty: number;
  difficultyText: string;
  userOwnsCount: number;
  authUserInUserOwns: boolean;
  rootOwnsCount: number;
  authUserHasReviewed: boolean;
  authUserInRootOwns: boolean;
  todo: boolean;
  competitive: boolean;
  active: any | null;
  feedbackForChart: any;
  ip: any | null;
  playInfo: any;
  labels: string[];
  recommended: boolean;
  priceTier: number;
  requiredSubscription: boolean;
  firstCreator: any | null;
  cocreators: any[];
  retiring: any;
  state: string;
  taskCompletionPercentage: string;
  spFlag: number;
  isSingleFlag: boolean;
}
