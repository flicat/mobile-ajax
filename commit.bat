@set/p commitlog= >nul
@git add -A
@git commit -m "%commitlog%"
@git push origin master
@cmd