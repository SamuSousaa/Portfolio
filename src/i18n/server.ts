import { cookies } from "next/headers";
import { LOCALE_COOKIE, resolveLocale } from "./config";
import { DICTS } from "./ui";

export async function getServerLocale() {
  return resolveLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}

export async function getServerDict() {
  return DICTS[await getServerLocale()];
}
