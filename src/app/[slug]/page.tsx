export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <main>
      <h1>Post: {params.slug}</h1>
    </main>
  );
}
