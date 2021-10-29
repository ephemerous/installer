//
// 2021.10.28
//
// upg: choice ... i'd like directions or i know what i'm doing.
// 	- ok,i'm ready...
// 	(watch video)
//
//
// upg: link to setup inscructions (pictures.. upg: video?)
//
// upg: abstract process with plug in dests.
//
//

import randStr from './lib-random-string.js'
import CloudflareHelper from './lib-cloudflare-helper.js'


const body = n=>{

return `
<style>
	main {display: grid; place-content: center; height: 100%; text-align: center;}
	.section {margin-top: 25px; margin-bottom: 25px}
	.item {margin-bottom: 15px;}

	input {border: none; outline: none; font-size: 16px; background:#111; color: #ccc; padding: 10px 15px 10px 15px; border-radius: 3px;}
	.title {margin-bottom: 3px;}
	.processing {color: yellow;}

	.status {font-size: 85%; opacity: 0.6; margin-top: 15px;}

</style>
	<div class='content'>
		<h1>Cloudflare Setup</h1>

		<div class='section'>
			<div class='section'>
				<div class='item'>
					<div class='title'>account id</div>
					<input placeholder='edf03abc98319fcbae832a8f82ad' name='cloudflareAccountId' value='' autofocus>
				</div>

				<div class='item'>
					<div class='title'>token</div>
					<input placeholder='BVw2za-wfio2aaf82q0-f2ava_fewf' value='' name='cloudflareToken'>
				</div>
			</div>
		</div>

		<a href='#next' class='next'>Next</a>
		<div class='status'></div>
	</div>
`}


class Setup {
	constructor(opts){

		console.log('build everything - v1')

		const url = new URL(window.location)
		const {searchParams} = url

		// optional
		this._accountId = searchParams.get('accountid')
		this._token = searchParams.get('token')

		
		opts = opts || {}
		this.api = opts.api

		const listNamespaces = n=>{
			}

		const dom = document.querySelector('main')
		dom.innerHTML = body()

		// security?
		dom.querySelector('[name=cloudflareAccountId]').value = this._accountId || ''
		dom.querySelector('[name=cloudflareToken]').value = this._token || ''


		const dS =  dom.querySelector('.status')

		const dN = dom.querySelector('.next')
		let _processing = false
		dN.onclick = async e=>{
			e.preventDefault()
			if(!_processing) {
				_processing = true

				dN.classList.add('processing')

				dS.textContent = 'installing...'
				//upg: check settings
				//const ok = await new Promise((res,rej)=>{
				//	setTimeout(n=>res({result:'not really'}),6000)
				//	})
				const ok = await trySettings()
				//console.log({ok},'!')
				if(ok){
					dS.textContent = 'installed.'//'waiting for service..'
					const e = new CustomEvent('done',{detail:ok})
					dom.dispatchEvent(e)
					}
				else
					alert('Check settings.')
				}
			else
				alert('provisioning...')
			}

		// ----------------------------------
		const provisionCloudflare = async n=>{
			const {api} = this
			const {accountId,token} = n
			const fetchProxy = api.fetchProxy.bind(api) // or?
			//console.log({accountId,token,fetchProxy})
			const cf = new CloudflareHelper({accountId,token,fetchProxy})


			const installId = randStr(7,'bcdfghjklmnpqrstvwxz') // or? 'xmple'//
			const namespace = `eph-${installId}`
			const proxyKey = randStr()
			const workerName = installId
			const activationKey = randStr(24) // or uuid?
			const apiKey = randStr()		// for things like write/edit/kv.
			const subdomain = await cf.getSubdomain()
			const installUrl = `https://${workerName}.${subdomain}.workers.dev`  // upg: allow set this on build.


			console.log({installId,namespace,proxyKey,activationKey,workerName,subdomain,installUrl})

			// process...
			// 	- figure install id : eg .. fiwj2fiwao
			//
			//	- create namespace
			//		- eph-fiwj2fiwao
			//
			// 	- create worker (give a random name (namespace))
			// 		- eph-fiwj2fiwao.ep1.workers.dev
			//
			// 	- create proxy key in namespacce
			// 		- proxy-key = key-jfffijwieofowijf89f83jfwefiojf8oefjwofji3890fj3
			//
			// 	- create activation code in namespace
			// 		- activation-code = fjifew-2348-sfdsdf-jkdsfjkl-234r234
			//
			// 	- copy app assets (to namespace kv)
			// 		- /static/index.html = file
			// 		- /static/main.js = file
			// 		etc
			//
			// 	- store access info in localstorage
			// 		- (not store the activation code)
			//
			//
			// 	- ready to forward to eph-fiwj2fiwao.ep1.wokrkers.dev/index.html (in iframe?)
			// 		- when say complete.. here's your access infos.
			// 			- host : fiwj2fiwao.ep1
			// 			- acctivation code: sfjksldkjfslkdjflsdfj -- save this and keep secret.
			//
			//
			// * could.. use namespaces? or? env vars? or? rather than eph-kfjewkfoewi.ep1. to detect installs.
			// 	- maybe NAMESPACE.get('about-eph')  (and namespace starts with eph-)
			// 
			// upg: how to deploy to route?

			const phone = async (cb)=>{
				cb = cb || (n=>{})
				const f = await fetch('./phone.zip')
				const b = await f.blob()
				const z = await JSZip.loadAsync(b)
				const {files,comment} = z
				const l = Object.keys(files)
				for(let i=0;i<l.length;i++){
					const v = l[i]
					const vv = files[v]
					const {dir} = vv
					const f = await vv.async('blob')
					if(!dir){
						if(v == 'worker.js'){
							//console.log('update worker',f)
							await cb('worker',f)
							}
						else {
							//console.log('copy',v,f)
							await cb('file',{name:'/'+v,data:f}) // or
							}
						}//if
					}//for
				}//func


			const vt = await (async n=>{
				const {errors,messages,result,success} = await cf.verifyToken()
				return success
				})();

			if(vt){

				console.log('settings correct!')
				//upg: check expire date (in vt result)
				//
				// -------------------------------------------------
				// namespace (kv)
				const cn = await (async n=>{
					//return false
					const {errors,messages,result,success} = await cf.createNamespace(namespace)
					return success?result:false
					})();
				const _cn = cn // {id: 'b1ffc99d260c498997169f20d210bc74', title: 'eph-xmple'}
				const {id:namespaceId,title:namespaceTitle} = _cn
				console.log('cccf',{namespaceId,namespaceTitle})

				const contentTypeMap = {
					html:'text/html',
					
					js:'application/javascript',
					
					png:'image/png',
					svg:'image/svg+xml'
					}

				await phone(async (name,data)=>{
					console.log('phone event',name,data)
					if(name == 'file'){
						const {name:n,data:d} = data
						const x = n.split('.')
						const ext = x.pop().toLowerCase()
						const type = contentTypeMap[ext] || 'application/octet-stream'

						const m = {contentType:type}
						await cf.kvSetWithMetadata(namespaceId,n,d,m)
						}
					else
					if(name == 'worker'){
						const metadata = {
							body_part: 'script',
							bindings: [
								{type:'kv_namespace',name:'NAMESPACE',namespace_id:namespaceId},
								]
							}

						const r = await cf.uploadWorker(workerName,data,metadata)
						const {success,result} = r
						console.log(r)
						}
					})


				// ----------------------------------------------------------
				// install info
				
				await (async n=>{
					const i = {
							cloudflare:{
								accountId,
								token
								},
							service:{
								apiUrl:installUrl,
								apiKey
								},
							installId
						}

					///, namespace, proxyKey, activationKey, workerName,subdomain, installUrl,apiKey
					await cf.kvSetWithMetadata(
						namespaceId,
						'/static/install.json',
						JSON.stringify(i),
						{contentType:'application/json'})
					})();

				// ----------------------------------------------------------
				// params
				console.log('Setting API KEY (params)',apiKey)
				await (async n=>{
					await cf.kvSet(
						namespaceId,
						'params',
						JSON.stringify({apiKey}),
						{contentType:'application/json'})
					})();

				// ----------------------------------------------
				// activate on worker sub-domain (upg: only activate on custom domain if you're bringing your own.)
				//
				console.log('activating',workerName)
				const ws = await cf.setWorkerSubdomainStatus(workerName,true)
				console.log({ws})
				//how long to wait .. prob need to scan as it's not everywhere.. for system to be up.

				return {cloudflareAccountId: accountId, installId, namespace, proxyKey, activationKey, workerName,subdomain, installUrl,apiKey}
				}
			else
				return false
			
		
			}//func


		// ----------------------------------
		const trySettings = async n=>{
			const {api} = this

			const settings = getSettings()
			
			const {cloudflareAccountId:accountId, cloudflareToken:token} = settings

			// see what's there now (allow select if exsiting?) .. NOW: make a new account.
			//const r = await checkCloudflare({accountId,token})
			if(accountId && token){
				return await provisionCloudflare({accountId,token})
				}
			else
				return false ///(r===true)?{id:accountId,token}:false
			}

		// ----------------------------------
		const getSettings = n=>{
			const r = {}
			const l = Array.from(document.querySelectorAll('input'))
			l.forEach(v=>{
				const name = v.getAttribute('name')
				const value = v.value
				r[name] = value
				})

			return r
			}

		return dom
		}
	}

export default Setup
