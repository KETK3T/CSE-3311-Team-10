import {useState, useEffect} from 'react'
import { supabase } from './supabase-client'

export const useAuth = () => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		supabase.auth.getSession().then(({data:{session} }) => {
			setUser(session?.user ?? null)
			setLoading(false)
		})

		const {data: {subscription}} = supabase.auth.onAuthStateChange((_event,session) => {
			setUser(session?.user ?? null)
		})

		return () => subscription.unsubscribe()
	}, [])

	return {user,loading}
}