all: 
	cd frontend && npm run build && cd ..
	cd backend && npm rebuild && cd ..
	docker-compose up --build

down:
	docker-compose down
	docker rmi -f ft_transcendence42-backend
	docker system prune -af --volumes

rebuild: down all