declare global {
  namespace Express {
    interface Request {
      currentTeamId?: string;
      currentEventId?: string;
    }
  }
}

export {};
