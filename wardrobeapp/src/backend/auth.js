import { supabase } from "./supabase-client";

export const register = async(email,password,username) => {
	try{
		const {data,error} = await supabase.auth.signUp({email, password})
		if (error){
			return {user: null, error: error.message}
		}

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
			return {user: null, error:error.message} 
		}
	}catch(e){
		return {user: null, error:e.message}
	}
}

export const resetPassword = async (email) => {
	const { error } = await supabase.auth.resetPasswordForEmail(email);
	return { error: error?.message || null };
}