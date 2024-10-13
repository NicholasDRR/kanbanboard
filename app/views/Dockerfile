# Usa a imagem do Nginx como base
FROM nginx:alpine

# Copia os arquivos do frontend para o diretório padrão do Nginx
COPY . /usr/share/nginx/html

# Expõe a porta 80 para servir os arquivos
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
