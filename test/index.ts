import http from 'http'
import SessionCenter from '../index'
let count = 0
type session = {
	count:number,
	time:string,
	id:number
}
const sessionCenter = new SessionCenter<session>({secure:false,maxAge:3600})
const server = http.createServer((req, res) => {
	const s = sessionCenter.getSession(req,res)
	if (s){
		s.count++
	} else{
		sessionCenter.setSession({
			count:0,
			time:new Date().toString(),
			id:count++
		},req,res)
	}
	res.end(JSON.stringify(sessionCenter.getSession(req,res)))
})
server.listen(8090)
