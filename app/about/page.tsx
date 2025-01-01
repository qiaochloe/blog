import Link from "next/link";

export const metadata = {
  title: "About",
  description: "About qioachloe.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">About</h1>
      <p>
        Hi, I'm Chloe. I am a sophomore at Brown University studying computer
        science. I write whatever is on my mind. The useful stuff is in{" "}
        <Link href="/writings" className="text-neutral-600 underline">
          writings
        </Link>{" "}
        and the personal stuff is in{" "}
        <Link href="/etc" className="text-neutral-600 underline">
          etc
        </Link>
        .
      </p>
    </section>
  );
}
