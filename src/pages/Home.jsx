import React, { useEffect, useState } from 'react'
import appwriteService from "../services/config"
import { Container, PostCard } from '../components'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

function Home() {
    const [postsList, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const authStatus = useSelector((state) => state.auth.status)

    useEffect(() => {
        appwriteService.getPosts().then((posts) => {
            if (posts) setPosts(posts.documents)
        }).finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="w-full py-32 flex justify-center">
                <div className="animate-pulse space-y-3 w-48">
                    <div className="h-3 bg-rule rounded w-full"></div>
                    <div className="h-3 bg-rule rounded w-3/4"></div>
                </div>
            </div>
        )
    }

    if (postsList.length === 0) {
        return (
            <div className="w-full py-32">
                <Container>
                    <div className="text-center border border-rule p-16">
                        <h1 className="font-serif text-3xl font-bold text-ink mb-4">
                            Islam &amp; Science
                        </h1>
                        <p className="font-sans text-ink-mid mb-8">
                            No articles have been published yet.
                            {authStatus && ' Be the first to write.'}
                        </p>
                        {authStatus && (
                            <Link
                                to="/add-post"
                                className="inline-block px-6 py-2.5 bg-ink text-paper text-sm font-sans uppercase tracking-widest hover:bg-ink-mid transition-colors"
                            >
                                Write an Article
                            </Link>
                        )}
                    </div>
                </Container>
            </div>
        )
    }

    return (
        <div className="w-full bg-paper">
            {/* Hero banner */}
            <div className="bg-ink py-20">
                <Container>
                    <div className="max-w-2xl mx-auto text-center px-4">
                        <p className="text-xs font-sans uppercase tracking-widest text-ink-faint mb-4">
                            In the Name of Allah
                        </p>
                        <h1 className="hero-title font-serif font-bold text-paper mb-6 leading-tight">
                            Seeking Knowledge,<br />Finding Peace
                        </h1>
                        <p className="font-sans text-ink-mid text-base mb-8 leading-relaxed">
                            Explore Islamic history, spirituality, and modern reflections.
                        </p>
                        <Link
                            to="/all-posts"
                            className="inline-block px-6 py-2.5 border border-ink-mid text-ink-faint text-sm font-sans uppercase tracking-widest hover:border-paper hover:text-paper transition-colors"
                        >
                            Browse Articles →
                        </Link>
                    </div>
                </Container>
            </div>

            <Container>
                {/* Featured post */}
                <div className="py-16">
                    <div className="flex items-baseline justify-between mb-8 border-b border-rule pb-3">
                        <h2 className="font-serif text-xl font-bold text-ink">Featured</h2>
                        <Link to="/all-posts" className="text-xs font-sans uppercase tracking-widest text-ink-faint hover:text-ink transition-colors">
                            All Articles →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                        <div className="aspect-[4/3] overflow-hidden bg-paper-dark">
                            {postsList[0].featuredimage && (
                                <img
                                    src={appwriteService.getFilePreview(postsList[0].featuredimage)}
                                    alt={postsList[0].title}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="flex flex-col gap-4">
                            <span className="text-xs font-sans uppercase tracking-widest text-ink-faint">
                                {new Date(postsList[0].$createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                            <h3 className="font-serif text-3xl font-bold italic text-ink leading-tight">
                                {postsList[0].title}
                            </h3>
                            <hr className="border-rule" />
                            <Link
                                to={`/post/${postsList[0].$id}`}
                                className="inline-block px-6 py-2.5 bg-ink text-paper text-sm font-sans uppercase tracking-widest hover:bg-ink-mid transition-colors self-start"
                            >
                                Read Article
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent posts grid */}
                {postsList.length > 1 && (
                    <div className="pb-16">
                        <h2 className="font-serif text-xl font-bold text-ink mb-8 border-b border-rule pb-3">
                            Recent Articles
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-rule">
                            {postsList.slice(1).map((post) => (
                                <div key={post.$id} className="bg-paper">
                                    <PostCard {...post} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Container>
        </div>
    )
}

export default Home
