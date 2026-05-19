import { randomUUID } from 'crypto';

export function createMeetingUrl(skillTitle: string): string {
  const slug = skillTitle.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  const uid = randomUUID().slice(0, 8);
  return `https://meet.jit.si/SkillUs-${slug}-${uid}`;
}
