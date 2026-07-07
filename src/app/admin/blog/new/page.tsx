import BlogForm from '../BlogForm';

export default function NewBlogPostPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#F5F5F5]">New Blog Post</h1>
        <p className="text-sm text-[#9A9A9A] mt-1">Write content as HTML for the public blog.</p>
      </div>
      <BlogForm />
    </div>
  );
}
