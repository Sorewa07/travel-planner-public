package com.travel.sorewa.backend.repository;

import com.travel.sorewa.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // これだけで、ユーザーの保存、ID検索、削除などの機能が自動的に使えるようになります！
}
