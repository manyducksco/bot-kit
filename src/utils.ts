const regexp = /@\[.*?\]\(.*?\)/g;

/**
 * Strip plain text mentions like `@[this](mention://<type>/<uuid>)` from message text.
 */
export function stripMentions(messageText: string): string {
  return messageText.replace(regexp, "");
}
