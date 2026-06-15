import type { Post } from "@/lib/types";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";

export function ArticleBody({ post, locale }: { post: Post; locale: Locale }) {
  return (
    <div className="prose-bs">
      <p className="text-lg font-medium text-neutral-900">{pick(post.content, locale)}</p>

      {post.sections?.map((section) => {
        const Tag = section.level === 2 ? "h2" : "h3";
        return (
          <div key={section.id}>
            <Tag id={section.id}>{pick(section.title, locale)}</Tag>
            {section.paragraphs.map((para, i) => (
              <p key={i}>{pick(para, locale)}</p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
