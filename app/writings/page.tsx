import { getPosts } from "app/utils";
import { PostsList } from "app/writings/PostsList";

export const metadata = {
  title: "Writings",
  description: "Writings from Chloe Qiao.",
};

export default function Page() {
  const allPosts = getPosts();

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Writings</h1>
      <PostsList allPosts={allPosts} />
    </section>
  );
}
