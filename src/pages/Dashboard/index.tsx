import { useCallback, useEffect, useState } from "react";
import { FoodsContainer } from "./styles";

import Header from "../../components/Header";
import Food from "../../components/Food";
import ModalAddFood from "../../components/ModalAddFood";
import ModalEditFood from "../../components/ModalEditFood";

import { FoodModel } from "../../models/FoodModel";
import api from "../../services/api";

function Dashboard() {
  const [foods, setFoods] = useState<FoodModel[]>([]);
  const [editingFood, setEditingFood] = useState<FoodModel>({} as FoodModel);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function getFoods(): Promise<void> {
      const response = await api.get("/foods");
      setFoods(response.data);
    }
    getFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: FoodModel) => {
      try {
        const response = await api.post("/foods", {
          ...food,
          available: true,
        });
        setFoods([...foods, response.data]);
      } catch (err) {
        console.log(err);
      }
    },
    [foods]
  );

  const handleUpdateFood = useCallback(
    async (food: Omit<FoodModel, "id" | "available">) => {
      try {
        const foodUpdated = await api.put(`/foods/${editingFood.id}`, {
          ...editingFood,
          ...food,
        });
        const foodsUpdated = foods.map((f) =>
          f.id !== foodUpdated.data.id ? f : foodUpdated.data
        );
        setFoods(foodsUpdated);
      } catch (err) {
        console.log(err);
      }
    },
    [editingFood, foods]
  );

  const handleDeleteFood = useCallback(
    async (id: number) => {
      await api.delete(`/foods/${id}`);
      const foodsFiltered = foods.filter((food) => food.id !== id);
      setFoods(foodsFiltered);
    },
    [foods]
  );

  const toggleModal = useCallback(() => {
    setModalOpen(!modalOpen);
  }, [modalOpen]);

  const toggleEditModal = useCallback(() => {
    setEditModalOpen(!editModalOpen);
  }, [editModalOpen]);

  const handleEditFood = useCallback(
    (food: FoodModel) => {
      setEditingFood(food);
      toggleEditModal();
    },
    [toggleEditModal]
  );

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map((food) => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}

export default Dashboard;
