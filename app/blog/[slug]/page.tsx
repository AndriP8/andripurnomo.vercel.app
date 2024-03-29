import { DocumentRenderer } from '@keystatic/core/renderer';
import { getBlogData, getBlogSlugs } from '@lib/data';
import { formatDate } from '@lib/utils';
import { TwitterEmbed, YouTubeEmbed } from '@ui/components';
import { Dots } from '@ui/components/Dots';
import { Metadata } from 'next';
import Image from 'next/image';
type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlogData(params.slug);

  return {
    title: blog?.title,
  };
}

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function Page({ params }: PageProps) {
  const blog = await getBlogData(params.slug);

  return (
    <div className="min-h-[80vh] h-full w-full bg-gray-50 max-w-4xl mx-auto my-28">
      {blog ? (
        <div className="mx-6 md:mx-16 lg:mx-0">
          <h1 className="text-4xl font-medium">{blog.title}</h1>
          <div className="mt-1 flex items-center gap-x-2 text-gray-500">
            <p>{formatDate(blog.createdAt)}</p>
            <Dots bgColor="bg-gray-500" />
            <p>{blog.timeToRead} min read</p>
          </div>
          <div className="mt-12">
            <Image
              src={`/images/blogs/${params.slug}/cover/resource.jpg`}
              alt={blog.cover?.alt ?? ''}
              width={700}
              height={500}
              className="rounded-md w-[700px] h-[500px] object-cover mx-auto"
              priority
            />
            <div className="flex justify-center mt-2">
              <span>
                Photo by{' '}
                <a
                  href={blog.cover?.ownerLink ?? ''}
                  target="_blank"
                  className="underline"
                >
                  {blog.cover?.owner}
                </a>
              </span>
            </div>
          </div>
          <main className="w-full mt-20 prose max-w-none break-word-blog-content">
            {blog.content ? (
              <DocumentRenderer
                document={await blog.content()}
                componentBlocks={{
                  youtubeEmbed: (props) => (
                    <YouTubeEmbed youtubeLink={props.youtubeLink} />
                  ),
                  twitterEmbed: (props) => {
                    const tweetId = props.tweet
                      .split('/status/')[1]
                      .split('?')[0];

                    return <TwitterEmbed tweetId={tweetId} />;
                  },
                  image: (props) => {
                    return (
                      <Image
                        src={props.src}
                        alt={props.alt}
                        width={props.width}
                        height={props.height}
                        className="w-auto h-auto mx-auto"
                        priority
                      />
                    );
                  },
                }}
              />
            ) : null}
          </main>
        </div>
      ) : (
        <div className="max-w-lg mx-auto">
          <h2>Oops! Something went wrong.</h2>
          <p>Please refresh the page to try again.</p>
        </div>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();

  return slugs.map((slug) => ({
    slug,
  }));
}
