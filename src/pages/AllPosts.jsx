import React, { useState, useEffect } from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../services/config";

function AllPosts() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        appwriteService.getPosts([]).then((posts) => {
            if (posts) setPosts(posts.documents)
            setLoading(false)
        })
    }, [])

    return (
        <div className="py-12 bg-paper min-h-screen">
            <Container>
                {/* Archive header */}
                <div className="mb-12 border-b border-rule pb-6">
                    <p className="text-xs font-sans uppercase tracking-widest text-ink-faint mb-2">Archive</p>
                    <h1 className="font-serif text-3xl font-bold text-ink">All Articles</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ink"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 border border-rule">
                        <p className="font-serif text-ink-mid text-lg">No articles found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-rule">
                        {posts.map((post) => (
                            <div key={post.$id} className="bg-paper">
                                <PostCard {...post} />
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    )
}

export default AllPosts
