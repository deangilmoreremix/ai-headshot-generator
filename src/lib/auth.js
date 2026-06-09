// No-op auth module - no authentication required
// All auth checks and session requirements have been removed as per requirements

export const authOptions = {};

export const getServerSession = async () => null;

// No sign-in walls - all operations are public
export const requireAuth = () => null;