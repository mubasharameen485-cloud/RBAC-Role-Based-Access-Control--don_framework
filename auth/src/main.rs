// example_app/src/main.rs

use don_core::{
    DonServer, AppState, 
    axum::{Router, extract::{State, Path}, Json, routing::{get, put, post}}
};
use don_core::traits::{DonAuthHooks, DonHooks};
use validator::Validate;
use don_macros::{DonAuth, DonGuard, DonModel};
use serde::{Deserialize, Serialize};

// ==========================================
// 1. MODELS & VALIDATION
// ==========================================

#[derive(Debug, Clone, Serialize, Deserialize, don_core::sqlx::FromRow, DonAuth, Validate)]
#[don_auth_key = "username"] 
#[don_validate]
pub struct User {
    pub id: i32,
    #[validate(length(min = 3, message = "Username must be at least 3 characters"))]
    pub username: String,
    #[validate(length(min = 4, message = "Password must be at least 4 characters"))]
    pub password: String,
    pub role: String,
    pub salary: i32,
}

// Auth Hooks (Signup se pehle check karna)
impl DonAuthHooks for User {
    async fn before_signup(&mut self) -> Result<(), String> {
        // Validation:only these 4 allowed
        let valid_roles = ["manager", "editor", "finance", "user"];
        if !valid_roles.contains(&self.role.as_str()) {
            return Err("Invalid Role! Must be manager, editor, finance, or user.".to_string());
        }
        Ok(())
    }
    async fn before_login(primary_key: &str) -> Result<(), String> {
        if primary_key == "hacker" {
            return Err("Security Alert: You are banned!".to_string());
        }
        Ok(())
    }
}

// Article Model (For Editor)
#[derive(Debug, Clone, Serialize, Deserialize, don_core::sqlx::FromRow, DonModel)]
pub struct Article {
    pub id: i32,
    pub title: String,
    pub content: String,
    pub is_published: bool,
}
impl DonHooks for Article {}

// ==========================================
// 2. DEFINE RBAC GUARDS (1-Line Magic)
// ==========================================

#[derive(DonGuard)]
#[don_role = "manager"]
pub struct ManagerGuard;

#[derive(DonGuard)]
#[don_role = "editor"]
pub struct EditorGuard;

#[derive(DonGuard)]
#[don_role = "finance"]
pub struct FinanceGuard;

// ==========================================
// 3. ROLE-SPECIFIC LOGIC & DASHBOARDS
// ==========================================

// A. MANAGER LOGIC: Can see total company salary expense
async fn manager_dashboard(
    _guard: ManagerGuard, // Protected!
    State(state): State<AppState>,
) -> Result<Json<don_core::serde_json::Value>, String> {
    
    // SQL Aggregation Query
    let row = don_core::sqlx::query!("SELECT SUM(salary) as total_salary FROM users")
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    let total = row.total_salary.unwrap_or(0);

    Ok(Json(don_core::serde_json::json!({
        "message": "Welcome Manager! Here is the company report.",
        "total_salary_expense": total
    })))
}

// B. EDITOR LOGIC: Can publish an article
async fn editor_publish_article(
    _guard: EditorGuard, // Protected!
    State(state): State<AppState>,
    Path(article_id): Path<i32>,
) -> Result<Json<don_core::serde_json::Value>, String> {
    
    don_core::sqlx::query("UPDATE articles SET is_published = TRUE WHERE id = $1")
        .bind(article_id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(Json(don_core::serde_json::json!({
        "success": true,
        "message": format!("Article {} has been published to the public!", article_id)
    })))
}

// C. FINANCE LOGIC: Can update a user's salary
#[derive(Deserialize)]
struct SalaryPayload { salary: i32 }

async fn finance_update_salary(
    _guard: FinanceGuard, // Protected!
    State(state): State<AppState>,
    Path(user_id): Path<i32>,
    Json(payload): Json<SalaryPayload>,
) -> Result<Json<don_core::serde_json::Value>, String> {
    
    don_core::sqlx::query("UPDATE users SET salary = $1 WHERE id = $2")
        .bind(payload.salary)
        .bind(user_id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(Json(don_core::serde_json::json!({
        "success": true,
        "message": format!("Salary for User {} updated to ${}", user_id, payload.salary)
    })))
}

// ==========================================
// 4. START THE SERVER
// ==========================================
#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    println!("Starting Don Framework with Advanced RBAC...");

    let rbac_routes = Router::new()
        // Manager Route
        .route("/api/manager/report", get(manager_dashboard))
        // Editor Route
        .route("/api/editor/publish/:id", put(editor_publish_article))
        // Finance Route
        .route("/api/finance/salary/:id", put(finance_update_salary))
        // Standard CRUD for Articles
        .nest("/api/articles", Article::get_api_routes());

    DonServer::new()
        .port(8080)
        .auth_key("username")
        .with_routes(User::get_auth_routes())
        .with_routes(rbac_routes)
        .start()
        .await
        .expect("Server crashed!");
}