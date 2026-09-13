package com.travel.sorewa.backend.service;

import com.travel.sorewa.backend.entity.User;
import com.travel.sorewa.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    // データベースを操作するUserRepositoryをここに繋ぎます
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * ログインの判定を行うメソッド
     * @param userId 入力されたユーザーID
     * @param password 入力されたパスワード
     * @return ログイン成功した場合はユーザー情報、失敗した場合は空(Optional.empty)を返す
     */
    public Optional<User> login(String userId, String password) {
        // 1. データベースから指定されたIDのユーザーを探す
        Optional<User> userOpt = userRepository.findById(userId);

        // 2. ユーザーが存在し、かつパスワードが一致しているかチェックする
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return userOpt; // ログイン成功！
        }

        return Optional.empty(); // ログイン失敗...
    }
    // 💡 👥【新設】JPAの標準機能を使って、登録されている全てのユーザーを丸ごとロードするメソッドです
    public List<User> getAllUsers() {
        return userRepository.findAll(); // これだけでMySQLの全ユーザーを引っ張ってこられます！
    }
    // 💡 👥【新設①】JPAの標準機能（save）を使って、新規ユーザーをuserテーブルに永久保存するメソッドです
    public User createUser(String userId, String userName, String password) {
        User user = new User();
        user.setUserId(userId);
        user.setUserName(userName);
        user.setPassword(password); // プレーンテキストでそのままセットします
        return userRepository.save(user); // MySQLへガチッと保存！
    }
    // 💡 👥【新設②】コントローラー側での重複チェック用：すでに同じユーザーIDが登録されているか調べるメソッドです
    public boolean existsById(String userId) {
        return userRepository.existsById(userId); // JPAの標準機能で1発でチェックします！
    }
    // 💡 👥【新設】JPAの標準機能を使って、既存のユーザー情報を安全に上書き更新するメソッドです
    public User updateUser(String userId, String userName, String password) {
        // 1. データベースから現在登録されている本物のユーザーデータを一度探して持ってきます
        return userRepository.findById(userId).map(user -> {
            // 2. 画面から新しく入力された「ユーザー名」に書き換えます
            user.setUserName(userName);

            // 3. もし「新しいパスワード」が入力されていた場合だけ、新しいパスワードに上書きします
            if (password != null && !password.trim().isEmpty()) {
                user.setPassword(password);
            }

            // 4. 上書きされた最新のデータをMySQLへガチッと保存（UPDATE）し直します！
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("指定されたユーザーが見つかりません: " + userId));
    }
}
