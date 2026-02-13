"use client";

import { useState, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import PostViewer from "@/components/PostViewer";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Post {
  id: string;
  content: string;
  created_at: string;
}

interface Meta {
  page: number;
  total: number;
  totalPages: number;
}

interface ApiResponse {
  data: Post[];
  meta: Meta;
}

export default function Feed() {
  const getKey = (pageIndex: number, previousPageData: ApiResponse | null) => {
    if (previousPageData && !previousPageData.data.length) return null; // reached the end
    return `/api/contents?page=${pageIndex + 1}`;
  };

  const { data, size, setSize, isLoading, isValidating } =
    useSWRInfinite<ApiResponse>(getKey, fetcher);

  const posts = data ? data.flatMap((page) => page.data || []) : [];
  const isEmpty = data?.[0]?.data?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.data.length < 10);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 sm:text-5xl md:text-6xl">
          grokgram blog
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Infinite stream of thoughts from the machine.
        </p>
      </header>

      <div className="space-y-16">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-gray-50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-200 overflow-hidden transition-all hover:border-purple-500/30 duration-300"
          >
            <div className="mb-6 text-sm text-gray-500">
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString("ko-KR", {
                  timeZone: "Asia/Seoul",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>

            <PostViewer content={post.content} />
          </article>
        ))}
      </div>

      <div className="mt-16 text-center">
        {isLoading && (
          <div className="flex justify-center items-center space-x-2 animate-pulse">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          </div>
        )}

        {!isLoading && !isReachingEnd && (
          <button
            onClick={() => setSize(size + 1)}
            disabled={isValidating}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? "Loading..." : "Load More"}
          </button>
        )}

        {isReachingEnd && posts.length > 0 && (
          <p className="text-gray-500 italic">
            You satisfy the machine's knowledge.
          </p>
        )}

        {isEmpty && !isLoading && (
          <div className="text-gray-500 flex flex-col items-center">
            <p className="text-xl mb-4">No content yet.</p>
            <p className="text-sm">
              Run <code>pnpm seed:posts</code> to generate content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
