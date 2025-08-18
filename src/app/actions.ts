"use server";

import { cookies } from 'next/headers';

export async function createCookies(token: string) {
  const url = new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000');
  console.log('CREATING COOKIE WITH DOMAIN - ', url.hostname);
  cookies().set({
    name: "token",
    value: token,
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
    domain: url.hostname === 'localhost' ? 'localhost' : undefined,
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function removeCookies() {
  cookies().delete({
    name: "token",
    path: "/",
  });
}

export async function getCookies(name: string) {
  const cookieStore = cookies();
  const cookie = await cookieStore.get(name);
  return cookie;
}

export async function authenticated() {
  const token = await getCookies("token");
  return !!token;
}
