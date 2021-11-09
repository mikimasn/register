import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
var config = {
    "clientid":process.env.client,
    "secret":process.env.secret,
    "redirect":process.env.redirect,
    "bot_token":process.env.token,
    "g_id":process.env.gid
};
console.log(config);
import fs from 'fs';
import mysql from 'mysql2';
var app = express().use(bodyParser.json());
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
app.use(cookieParser());
app.get('/',(req,res)=>{
    if(req.cookies!==undefined)
    {
        if(req.cookies.token!==undefined)
        {
            var access = verifyaccess(req.cookies.token,(access)=>{
            console.log(access.ok);
            if(access.ok)
            {
                var file = fs.readFileSync('./login.html').toString();
                file = file.replace('!!!_YOURNAME_!!!',access.name);
                if(!(access.sent))
                    res.send(file);
            }
            else
            {
                res.send(fs.readFileSync('./not_login.html').toString()) 
            }
        });
        }
        else
        {
            console.log("tutej");
            res.send(fs.readFileSync('./not_login.html').toString()) 
        }
    }
    else
    {
        var response = fs.readFileSync('./not_login.html').toString();
        res.send(response)
    }
});
app.post('/',(req,res)=>{
    if(req.cookies!==undefined)
    {
        if(req.cookies.token!==undefined)
        {
            var access = verifyaccess(req.cookies.token,(access)=>{
            console.log(access.ok);
            if(access.ok&&!(access.sent))
            {
                dbregister(access.id,req.body.name,(result)=>{
                    if(result)
                    {
                        res.send("ok");
                    }
                    else
                    {
                        res.send("spróbuj ponownie");
                    }
                })
            }
            else
            {
                res.send(fs.readFileSync('./not_login.html').toString()) 
            }
        });
        }
        else
        {
            console.log("tutej");
            res.send(fs.readFileSync('./not_login.html').toString()) 
        }
    }
    else
    {
        var response = fs.readFileSync('./not_login.html').toString();
        res.send(response)
    }
})
app.get('/login',async (req,res)=>{
    if(req.query.code)
    {
        try {
			const oauthResult = fetch('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: config.clientid,
					client_secret: config.secret,
					grant_type: 'authorization_code',
                    code:req.query.code,
					redirect_uri: config.redirect,
					scope: 'identify',
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			const oauthData = await oauthResult.json();
            if(oauthData.error!==undefined&&oauthResult.scope!=='identify email connections guilds guilds.join')
            {
                res.send("error try again");
            }
            else
            {
                
                res.cookie('token',oauthData.access_token,{maxAge:parseInt(oauthData.expires_in)*1000});
                res.send("Gotowe <a href='/'>Przejdź żeby ustawić swoją nazwę minecraft</a>")
            }
            
		} catch (error) {
			// NOTE: An unauthorized token will not throw an error;
			// it will return a 401 Unauthorized response in the try block above
			console.error(error);
		}
    }
    else
    {
        res.send("not work")
    }
})
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening!'));
async function verifyaccess(token,callback)
{
var name = null;
var ok = false;
var id = null;
var sent=false;
    try {
        const oauthResult = await fetch('https://discord.com/api/oauth2/@me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization':'Bearer '+token
            },
        });

        const oauthData = await oauthResult.json();
        console.log(oauthData);
        if(oauthData.code==0&&oauthData["application"]["id"]!=='907321397716598814')
        {
            console.log(oauthData);
            callback({ok:ok,name:name,id:id,sent:sent});
            sent=true;
        }
        else
        {
            name=oauthData.user.username;
            id=oauthData.user.id;
            try {
                const oauthResult = await fetch('https://discord.com/api/users/@me/guilds', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization':'Bearer '+token
                    },
                });
        
                const oauthData = await oauthResult.json();
                console.log(oauthData.find(element=>element.id==='695225372265939015'));
                    if(oauthData.find(element=>element.id==='695225372265939015')!==undefined)
                    {
                        ok = true;
                        callback({ok:ok,name:name,id:id,sent:sent});
                        sent=true;
                    }
                    else
                    {
                        callback({ok:ok,name:name,id:id,sent:sent});
                        sent=true;
                    }
                    
                
            } catch (error) {
                // NOTE: An unauthorized token will not throw an error;
                // it will return a 401 Unauthorized response in the try block above
                console.error(error);
                callback({ok:ok,name:name,id:id,sent:sent});
                sent=true;
            }
        }
        
    } catch (error) {
        // NOTE: An unauthorized token will not throw an error;
        // it will return a 401 Unauthorized response in the try block above
        console.error(error);
        callback({ok:ok,name:name,id:id,sent:sent});
        sent=true;
    }
    
}
function dbregister(id,name,callback)
{

}