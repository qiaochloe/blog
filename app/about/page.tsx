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
        science.
      </p>
      <br />
      <p>
        I write. The long-form stuff is in{" "}
        <Link href="/writings" className="text-neutral-600 underline">
          writings
        </Link>
        . I take responsibility for only the things written after{" "}
        {new Date(new Date().getTime() + 24 * 60 * 60).toUTCString()}.
      </p>
      <br />
      <p>
        For what I'm up to now, see{" "}
        <Link href="/now" className="text-neutral-600 underline">
          here
        </Link>
        .
      </p>
    </section>
  );
}
