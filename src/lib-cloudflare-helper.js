//
//  2021.10.03 -- cloudflare helper
//
//
// review... do we need to .. escape prob not that doing encode compoonent.

class CloudflareHelper {
	//
	// https://api.cloudflare.com/#workers-kv-namespace-list-namespaces
	// https://api.cloudflare.com/#worker-script-properties
	//
	//
	// upg: could make a class for each api group or?
	//
	constructor(opts){
		opts = opts || {}
		const {accountId,token,fetchProxy} = opts
		this.accountId = accountId
		this.token = token
		this.fetchProxy = fetchProxy

		this.base = 'https://api.cloudflare.com/client/v4'
		}

	// -----------------
	subBase(type){
		const {accountId} = this
		if(type == 'accounts')
			return `/accounts/${encodeURIComponent(accountId)}`
		else
			return ''
		}

	// -----------------
 	async req(u,opts){
		const {token,fetchProxy} = this

		opts = opts || {}
		const {base} = this
	
		const _opts = JSON.parse(JSON.stringify(opts))

		//patch or?
		if(opts.body instanceof FormData) // or always map this here?
			_opts.body = opts.body

		_opts.headers = _opts.headers || {}
		_opts.headers.Authorization = 'Bearer '+token

		const uu = `${base}${u}`
		
		//console.log('req!!!!!!!',uu,_opts);//return;

		return await fetchProxy(uu,_opts)
		}

	// -----------------
	async verifyToken(){
		const u = '/user/tokens/verify'
		const opts = {
			'Content-Type':'application/json'
			}

		const f = await this.req(u,opts)
		return await f.json()
		}

	// -----------------
	async createNamespace(title){
		const u = this.subBase('accounts')+'/storage/kv/namespaces'
		const opts = {
			method:'POST',
			headers:{
				'Content-Type':'application/json',
				},
			body: JSON.stringify({title})
			}
		const f= await this.req(u,opts)
		return await f.json()
		}//func

	// -----------------
	async uploadWorker(name,content,metadata){
		//
		//?? https://community.cloudflare.com/t/bind-kv-and-workers-via-api/221391
		//

		metadata = metadata || {}
		content = content || ''

		const _name = encodeURIComponent(name.replace('..','__')) // checkthis.. or?
		const u = this.subBase('accounts')+'/workers/scripts/'+_name

		const scriptBlob = new Blob([content],{type:'application/javascript'})
		const metadataBlob = new Blob([JSON.stringify(metadata)],{type:'application/json'})

		const d = new FormData()
		d.append('metadata',metadataBlob)
		d.append('script',scriptBlob)
		//console.log({content,metadata})


		const opts = {
			method:'PUT',
			headers:{
				//'Content-Type':'application/javascript',
				},
			body: d
			}
		const f = await this.req(u,opts)
		return await f.json()
		}//func


	// -----------------
	async setWorkerSubdomainStatus(name,enabled){
		//
		// upg: can this be set in metadata when updating script?  (though might want to wait till all setup completed before activating.)
		//
		// where's the docs?
		//
		// check source for wrangeler for pointers
		// https://dash.cloudflare.com/api/v4/accounts/daxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/workers/scripts/eph-mqgbkno/subdomain
		const _name = encodeURIComponent(name.replace('..','__')) // checkthis.. or?
		const u = this.subBase('accounts')+'/workers/scripts/'+_name+'/subdomain'

		const opts = {
			method:'POST',
			headers:{
				'Content-Type':'application/json',
				},
			body: JSON.stringify({enabled})
			}
		const f = await this.req(u,opts)
		return await f.json()
		}//func

	// -----------------
	async kvSet(namespaceId,tag,value){
		const _ns = encodeURIComponent(namespaceId.replace('..','__'))
		const _tag = encodeURIComponent(tag.replace('..','__'))
		const u = this.subBase('accounts')+'/storage/kv/namespaces/'+_ns+'/values/'+_tag//??tt=1111111

		const opts = {
			method:'PUT',
			headers:{
				'Content-Type':'text/plain',
				},
			body: value
			}

		const f = await this.req(u,opts)
		return await f.json()
		}//func

	// -----------------
	async kvSetWithMetadata(namespaceId,tag,value,metadata){

		const _ns = encodeURIComponent(namespaceId.replace('..','__'))
		const _tag = encodeURIComponent(tag.replace('..','__'))
		const u = this.subBase('accounts')+'/storage/kv/namespaces/'+_ns+'/values/'+_tag//??tt=1111111

		const metadataBlob = new Blob([JSON.stringify(metadata)],{type:'application/json'})

		const d = new FormData()
		d.append('value',value)
		d.append('metadata',metadataBlob)

		const opts = {
			method:'PUT',
			body: d
			}

		console.log({u,opts,tag,value})
		const f = await this.req(u,opts)
		return await f.json()
		}//func

	// -----------------
	async listNamespaces(opts){
		//upg: opts for limits etc
		//page,per_page,order,direction
		//this.req('/storage/kv/namespaces')
		}

	// -----------------
	async getSubdomain(){
		let r = false

		const u = this.subBase('accounts')+'/workers/subdomain'
		const opts = {
			'Content-Type':'application/json'
			}

		const f = await this.req(u,opts)
		const {success,result} = await f.json()
		if(success)
			r = (result||{}).subdomain

		return r
		}

	}//class

export default CloudflareHelper
