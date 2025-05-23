import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About",
  description: "About qioachloe.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">About</h1>
      <div className="my-4">
        <Image src="/about/chloe.png" alt="Chloe" width={250} height={500} />
      </div>
      <p>
        Hi, I'm Chloe. I am student at Brown University studying computer
        science. (Believe me, I gave other things my best shot.)
      </p>
      <br />
      <p>
        I write. The long-form stuff is in{" "}
        <Link href="/writings" className="text-neutral-600 underline">
          writings
        </Link>
        .
      </p>
      <br />
      <p>
        For what I am up to now, see{" "}
        <Link href="/now" className="text-neutral-600 underline">
          now
        </Link>
        .
      </p>
    </section>
  );
}
