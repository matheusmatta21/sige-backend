import pandas as pd
from sqlalchemy import create_engine, text

# 1. Conexão direta com o PostgreSQL (sem variáveis de ambiente)
DATABASE_URL = "postgresql://postgres:12345678@localhost:5432/sige_game_sales"
engine = create_engine(DATABASE_URL)

# 2. Leitura do arquivo CSV
CSV_PATH = "Video_Games.csv"
print(f"Lendo '{CSV_PATH}'...")
df = pd.read_csv(CSV_PATH)

# 3. Tratamento e sanitização dos dados
print("Tratando os dados...")

# Vendas como float (preenchendo valores nulos com 0.0)
sales_cols = ['NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales', 'Global_Sales']
for col in sales_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0).astype(float)

# Notas como float (mantendo NaN para virar NULL no Postgres)
df['Critic_Score'] = pd.to_numeric(df['Critic_Score'], errors='coerce').astype(float)
df['User_Score'] = pd.to_numeric(df['User_Score'], errors='coerce').astype(float)

# Contagens e anos como inteiros anuláveis
df['Year_of_Release'] = pd.to_numeric(df['Year_of_Release'], errors='coerce').astype('Int64')
df['Critic_Count'] = pd.to_numeric(df['Critic_Count'], errors='coerce').astype('Int64')
df['User_Count'] = pd.to_numeric(df['User_Count'], errors='coerce').astype('Int64')

# Strings dimensionais
df['Platform'] = df['Platform'].fillna('Unknown').astype(str).str.strip()
df['Genre'] = df['Genre'].fillna('Unknown').astype(str).str.strip()
df['Publisher'] = df['Publisher'].fillna('Unknown').astype(str).str.strip()
df['Rating'] = df['Rating'].fillna('Not Rated').astype(str).str.strip()
df['Name'] = df['Name'].fillna('Unknown').astype(str).str.strip()


# 4. Função auxiliar para carga idempotente das dimensões
def populate_dimension(df_source: pd.DataFrame, source_col: str, table_name: str) -> pd.DataFrame:
    print(f"Processando dimensão '{table_name}'...")
    
    with engine.begin() as conn:
        conn.execute(text(f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );
        """))
    
    unique_names = pd.DataFrame(df_source[source_col].dropna().unique(), columns=['name'])
    existing_records = pd.read_sql_table(table_name, con=engine)
    
    new_records = unique_names[~unique_names['name'].isin(existing_records['name'])]
    if not new_records.empty:
        new_records.to_sql(table_name, con=engine, if_exists='append', index=False)
        
    return pd.read_sql_table(table_name, con=engine)


# 5. Carga das dimensões
dim_platforms = populate_dimension(df, 'Platform', 'dim_platforms')
dim_genres = populate_dimension(df, 'Genre', 'dim_genres')
dim_publishers = populate_dimension(df, 'Publisher', 'dim_publishers')
dim_ratings = populate_dimension(df, 'Rating', 'dim_ratings')


# 6. Criação da tabela fato
with engine.begin() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS fact_game_sales (
            id SERIAL PRIMARY KEY,
            name VARCHAR(500) NOT NULL,
            year_of_release INT,
            platform_id INT REFERENCES dim_platforms(id),
            genre_id INT REFERENCES dim_genres(id),
            publisher_id INT REFERENCES dim_publishers(id),
            rating_id INT REFERENCES dim_ratings(id),
            na_sales NUMERIC(10, 2) DEFAULT 0.0,
            eu_sales NUMERIC(10, 2) DEFAULT 0.0,
            jp_sales NUMERIC(10, 2) DEFAULT 0.0,
            other_sales NUMERIC(10, 2) DEFAULT 0.0,
            global_sales NUMERIC(10, 2) DEFAULT 0.0,
            critic_score REAL,
            critic_count INT,
            user_score REAL,
            user_count INT
        );
    """))


# 7. Relacionamento das chaves estrangeiras
print("Mapeando chaves estrangeiras...")
df_merged = df.merge(
    dim_platforms.rename(columns={'id': 'platform_id', 'name': 'Platform'}),
    on='Platform',
    how='left'
)
df_merged = df_merged.merge(
    dim_genres.rename(columns={'id': 'genre_id', 'name': 'Genre'}),
    on='Genre',
    how='left'
)
df_merged = df_merged.merge(
    dim_publishers.rename(columns={'id': 'publisher_id', 'name': 'Publisher'}),
    on='Publisher',
    how='left'
)
df_merged = df_merged.merge(
    dim_ratings.rename(columns={'id': 'rating_id', 'name': 'Rating'}),
    on='Rating',
    how='left'
)

# 8. Montagem do DataFrame final da fato
fact_df = pd.DataFrame({
    'name': df_merged['Name'],
    'year_of_release': df_merged['Year_of_Release'],
    'platform_id': df_merged['platform_id'],
    'genre_id': df_merged['genre_id'],
    'publisher_id': df_merged['publisher_id'],
    'rating_id': df_merged['rating_id'],
    'na_sales': df_merged['NA_Sales'],
    'eu_sales': df_merged['EU_Sales'],
    'jp_sales': df_merged['JP_Sales'],
    'other_sales': df_merged['Other_Sales'],
    'global_sales': df_merged['Global_Sales'],
    'critic_score': df_merged['Critic_Score'],
    'critic_count': df_merged['Critic_Count'],
    'user_score': df_merged['User_Score'],
    'user_count': df_merged['User_Count']
})

# 9. Inserção dos registros em lotes de 1.000
print(f"Inserindo {len(fact_df)} registros na tabela 'fact_game_sales'...")
fact_df.to_sql(
    'fact_game_sales',
    con=engine,
    if_exists='append',
    index=False,
    chunksize=1000,
    method='multi'
)

print("Carga finalizada com sucesso!")
