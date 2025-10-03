export async function exportToSheet({rows, sheetId, range}){
  // In a real project, wire OAuth2 client here. For now, log-only to keep Termux-safe.
  console.log("[gsheets] export", {count rows?.length||0, sheetId, range});
  return {oktrue};
}
