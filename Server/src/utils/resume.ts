// Where uploaded resumes are served from (see resumeController + the static
// /uploads mount in index.ts).
export const RESUME_URL_PREFIX = '/uploads/resumes/';

// Student.resumeUrl was historically a free-text field (the Add/Edit student
// forms let anyone type anything — e.g. "ffx"). A resume only counts as
// usable if it's a file uploaded through the resume endpoint, or a real
// http(s) link; anything else is treated as "no resume".
export const isUsableResumeUrl = (url?: string | null): url is string =>
  !!url && (url.startsWith(RESUME_URL_PREFIX) || /^https?:\/\//i.test(url));
