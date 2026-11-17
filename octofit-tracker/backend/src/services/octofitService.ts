import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const body = input as Record<string, unknown>;

  if (!body.userId || !body.teamId || !body.type || typeof body.minutes !== 'number') {
    const error = new Error('Missing required fields: userId, teamId, type, minutes');
    throw Object.assign(error, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(body.userId as string) || !mongoose.Types.ObjectId.isValid(body.teamId as string)) {
    const error = new Error('Invalid userId or teamId format');
    throw Object.assign(error, { status: 400 });
  }

  const user = await User.findById(body.userId);
  const team = await Team.findById(body.teamId);

  if (!user || !team) {
    const error = new Error('User or team not found');
    throw Object.assign(error, { status: 404 });
  }

  const points = Math.max(10, Math.round((body.minutes as number) / 2));
  const activity = await Activity.create({
    user: body.userId,
    team: body.teamId,
    type: body.type,
    minutes: body.minutes,
    points,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = input as Record<string, unknown>;

  if (!body.name) {
    const error = new Error('Team name is required');
    throw Object.assign(error, { status: 400 });
  }

  const teamData = {
    name: body.name,
    mascot: body.mascot,
    members: Array.isArray(body.members) ? body.members : [],
  };

  const team = await Team.create(teamData);
  return team.toObject();
}

export async function getLeaderboard() {
  const activities = await Activity.find().lean();
  
  const teamPoints = new Map<string, { teamName: string; totalPoints: number; teamId: string }>();

  for (const activity of activities) {
    const team = await Team.findById(activity.team).lean();
    if (!team) continue;

    const teamId = activity.team.toString();
    if (!teamPoints.has(teamId)) {
      teamPoints.set(teamId, { teamName: team.name, totalPoints: 0, teamId });
    }

    const entry = teamPoints.get(teamId)!;
    entry.totalPoints += activity.points;
  }

  const sorted = Array.from(teamPoints.values())
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, index) => ({
      teamName: entry.teamName,
      totalPoints: entry.totalPoints,
      rank: index + 1,
    }));

  return sorted;
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();

  if (!user) {
    const error = new Error('User not found');
    throw Object.assign(error, { status: 404 });
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(10).lean();

  let preferredFocus = user.fitnessGoal;
  if (recentActivities.length > 0) {
    const activityTypes = recentActivities.map((a) => a.type);
    if (activityTypes.includes('run')) {
      preferredFocus = 'endurance';
    } else if (activityTypes.includes('strength')) {
      preferredFocus = 'strength';
    } else if (activityTypes.includes('cycle')) {
      preferredFocus = 'endurance';
    }
  }

  const workouts = await Workout.find({ focus: preferredFocus }).lean();

  if (workouts.length === 0) {
    const allWorkouts = await Workout.find().lean();
    return allWorkouts.slice(0, 1).map((w) => ({
      ...w,
      reason: 'Based on your recent activity',
    }));
  }

  return workouts.map((w) => ({
    ...w,
    reason: `Matches your ${preferredFocus} focus from recent activity`,
  }));
}

export { User };
