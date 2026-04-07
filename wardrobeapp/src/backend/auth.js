import { supabase } from "./supabase-client";

export const register = async(email,password,username) => {
	try{

		const {data: existing} = await supabase
			.from('profiles')
			.select('id')
			.eq('username', username.trim().toLowerCase())
			.maybeSingle()

		if(existing){
			return {user: null, error: 'That username is aready taken.'}
		}



		const {data,error} = await supabase.auth.signUp({email, password})
		if (error){
			if(error.message.toLowerCase().includes('already registered')){
				return {user: null, error: 'An account with this email already exists.'}
			}
			return {user: null, error: error.message}
		}
		if(!data.user) return {user: null, error: 'Account could not be created.'}

		const {error: profileError} = await supabase
			.from('profiles')
			.insert({id: data.user.id, username})

		if(profileError){
			return {user:null, error: profileError.message}
		}

		return{user: data.user,error:null}
	}catch(e){
		return {user: null, error:e.message}
	}
}

export const login = async (email,password) => {
	try{
		const {data,error} = await supabase.auth.signInWithPassword({email,password})
		if(error){
			if(error.message.toLowerCase().includes('login credentials')){
				return {user: null, error: 'email or password is incorrect'}
			}
			return {user: null, error:error.message} 
		}
		if(!data.user) return {user: null, error: 'No Account found with that username or password'}
		return{user: data.user,error:null}
	}catch(e){
		return {user: null, error:e.message}
	}
}

export const resetPassword = async (email) => {
	const { error } = await supabase.auth.resetPasswordForEmail(email);
	return { error: error?.message || null };
}

export const logout = async () => {
	const {error} = await supabase.auth.signOut()
	return {error: error?.message || null}
}