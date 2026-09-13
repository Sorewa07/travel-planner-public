package com.travel.sorewa.backend.controller;

import com.travel.sorewa.backend.entity.User;
import com.travel.sorewa.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*") // 👈 React（Vite）からのアクセスを許可する設定です
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * ログインを受け付けるAPI
     * URL: http://localhost:8080/api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String userId = credentials.get("userId");
        String password = credentials.get("password");

        // Serviceを使ってログイン判定を行う
        Optional<User> userOpt = userService.login(userId, password);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // ログイン成功時：パスワードは隠して、ユーザー名とIDをReactに返します
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "userId", user.getUserId(),
                    "userName", user.getUserName()
            ));
        } else {
            // ログイン失敗時：401 Unauthorized エラーを返します
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", "error",
                    "message", "ユーザーIDまたはパスワードが間違っています"
            ));
        }
    }
    /**
     * 👀【新設】登録されている全ユーザーをリストで優しく返すAPI
     * URL: GET /api/user
     */
    @GetMapping("/user")
    public ResponseEntity<List<User>> getAllUsers() {
        // 💡 サービスを呼び出して、MySQLのuserテーブルから全員分をロードします
        List<User> list = userService.getAllUsers();
        return ResponseEntity.ok(list);
    }
    /**
     * 👤【新設】管理画面からの新規ユーザー登録を受け付けるAPI
     * URL: POST http://localhost:8080/api/auth/user
     */
    @PostMapping("/user") // 🎯 クラスの頭の /api/auth と合体して「/api/auth/user」になります！
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> requestBody) {
        try {
            String userId = requestBody.get("userId");
            String userName = requestBody.get("userName");
            String password = requestBody.get("password");

            // 💡 ユーザーIDが既に使われていないか重複チェック
            if (userService.existsById(userId)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("status", "error", "message", "このユーザーIDは既に登録されています"));
            }

            // 👥 UserServiceを使って、MySQLのuserテーブルへガチッと永久保存します！
            // (※お手元のUserServiceの登録メソッド名に合わせて適宜調整してください)
            User newUser = userService.createUser(userId, userName, password);

            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "error", "message", "ユーザーの登録に失敗しました"));
        }
    }
    /**
     * 👤【新設】管理画面からの既存ユーザー情報の更新（編集）を受け付けるAPI
     * URL: PUT http://localhost:8080/api/auth/user/{id}
     */
    @PutMapping("/user/{id}") // 🎯 クラスの頭の /api/auth と合体して「/api/auth/user/{id}」の窓口になります！
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, String> requestBody) {
        try {
            String userName = requestBody.get("userName");
            String password = requestBody.get("password"); // 新しいパスワード（空欄ならnullが入ります）

            // 💡 先ほどUserService.javaに作成していただいた上書き保存メソッドを呼び出します！
            User updatedUser = userService.updateUser(id, userName, password);

            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "error", "message", "ユーザー情報の更新に失敗しました"));
        }
    }
}
