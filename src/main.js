import CloudflareHelper from './lib-cloudflare-helper.js'

import InstallLocation from './install-location.js'
import CloudflareInstall from './cloudflare-install.js'
import WaitForService from './wait-for-service.js'
import Ready from './ready.js'

//
// next: newest workers (from cf?)
// 
// upg: install from qr code? .. like scan json for cloudflare etc. [service:'',var1,var2,etc}
//

// =================================================
;(async n=>{

	const config = await (async n=>{
		const f = await fetch('./config.json')
		return f.json()
		})();

	console.log({config})

	// ----------------------------------------------------
	const settings = {
		fetchProxyUrl: config.worker_url,//'https://get.ephemerous.com/api/fetch-proxy',//'./api/fetch-proxy',  // upg: from config.js?
		fetchProxyToken: ''
		}
	const {fetchProxyUrl,fetchProxyToken} = settings

	// -----------------------------------------
	const fetchProxy = async (u,opts)=>{
		opts = opts || {}
		opts.headers = opts.headers || {}

		const o = JSON.parse(JSON.stringify(opts))
		o.body = opts.body // incase form data etc.

		o.headers['x-proxy-url']  = u

		const f = await fetch(fetchProxyUrl,o)
		
		return f
		}//func


	const dom = document.querySelector('body')

	const api = {fetchProxy}

	// ----------------------------------------------------


	// ---------------------------------
	const use = a=>{
		dom.innerHTML = ''
		dom.appendChild(a)

		return a
		}

	// ---------------------------------
	const switchTo = N=>{
		const a = new N({api})
		return use(a)
		}

	
	const a = switchTo(InstallLocation)
	a.addEventListener('select',({detail:s})=>{
		if(s == 'hosted'){
			alert('Try Cloudflare? Prepaid service not yet available.')
			}
		else
		if(s == 'cloudflare'){
			const a = switchTo(CloudflareInstall)
			a.addEventListener('done',({detail:i})=>{
				console.log('done',i,'next: wait for service')
				const {installUrl} = i
				
				const a = use(new WaitForService({api,checkUrl:installUrl+'/up'}))
				a.addEventListener('ready',e=>{
					console.log('ready. switch to',installUrl)
					//const a = switchTo(Ready)
					location = installUrl
					})
				})
			}
		})

	})();
